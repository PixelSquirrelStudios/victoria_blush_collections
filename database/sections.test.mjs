import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { PGlite } from '@electric-sql/pglite';
import { sectionSchema, isSafeSectionLink } from '../lib/sections.ts';
import { sanitizeSectionCopy, hasSectionCopy } from '../lib/section-html.ts';

test('section schema and rich text safety', () => {
  const section = { heading: 'Heading', copy: '<p>Copy</p>', has_cta: false, background_colour: 'white' };
  assert.equal(sectionSchema.parse(section).type, 'education');
  assert.equal(sectionSchema.parse(section).position, 'centre');
  assert.equal(sectionSchema.parse(section).image_url, '');
  assert.equal(sectionSchema.parse(section).image_alt, '');
  for (const image_url of ['', '/assets/images/Vicky.jpg', 'https://example.com/image%20one.jpg']) {
    assert.equal(sectionSchema.parse({ ...section, image_url }).image_url, image_url);
  }
  for (const image_url of ['javascript:alert(1)', '//example.com/image.jpg', 'mailto:hello@example.com', 'data:image/png;base64,test', '#image']) {
    assert.equal(sectionSchema.safeParse({ ...section, image_url }).success, false);
  }
  assert.equal(sectionSchema.safeParse({ ...section, image_alt: 'a'.repeat(501) }).success, false);
  for (const position of ['left', 'centre', 'right']) assert.equal(sectionSchema.parse({ ...section, position }).position, position);
  for (const position of ['top', '', null]) assert.equal(sectionSchema.safeParse({ ...section, position }).success, false);
  assert.equal(sectionSchema.safeParse({ ...section, type: 'invalid' }).success, false);
  assert.equal(sectionSchema.safeParse({ ...section, background_colour: 'red' }).success, false);
  assert.equal(sectionSchema.safeParse({ ...section, has_cta: true }).success, false);
  for (const link of ['javascript:alert(1)', '//example.com', '/\\example.com', 'data:text/html,test']) assert.equal(isSafeSectionLink(link), false);
  for (const link of ['/contact', '#section-1', 'https://example.com/book', 'mailto:hello@example.com']) assert.equal(isSafeSectionLink(link), true);
  const clean = sanitizeSectionCopy('<script>alert(1)</script><p onclick="evil()">Copy</p><a href="javascript:alert(1)">Bad</a><ul><li>Keep</li></ul>');
  assert.equal(clean.includes('script'), false);
  assert.equal(clean.includes('onclick'), false);
  assert.equal(clean.includes('javascript:'), false);
  assert.ok(clean.includes('<ul><li>Keep</li></ul>'));
  assert.equal(sanitizeSectionCopy('<span style="text-decoration: underline; position: fixed">Underlined</span>'), '<span style="text-decoration:underline">Underlined</span>');
  assert.equal(hasSectionCopy('<p>&nbsp;</p>'), false);
});

test('migration, seeds, permissions, CRUD and atomic per-page ordering', async () => {
  const database = new PGlite();
  try {
    await database.exec(`
      CREATE ROLE anon;
      CREATE ROLE authenticated;
      CREATE SCHEMA auth;
      CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql AS $$
        SELECT nullif(current_setting('request.jwt.claim.sub', true), '')::uuid
      $$;
      GRANT USAGE ON SCHEMA auth TO anon, authenticated;
      CREATE TABLE education (hero_heading text);
      INSERT INTO education VALUES ('Keep existing hero');
    `);
    const migration = readFileSync(new URL('./sections.sql', import.meta.url), 'utf8');
    await database.exec(migration);
    const initial = (await database.query('SELECT * FROM sections ORDER BY sort_order')).rows;
    assert.equal(initial.length, 10);
    assert.equal(initial.filter((section) => section.has_cta).length, 4);
    assert.ok(initial[0].heading.startsWith('You might still love hair.'));
    assert.ok(initial[9].heading.startsWith('You are allowed to love hair'));
    for (const [index, section] of initial.entries()) {
      assert.equal(section.sort_order, index);
      assert.equal(section.background_colour, index % 2 === 0 ? 'green' : 'white');
      assert.equal(section.position, 'centre');
      assert.equal(section.image_url, '');
      assert.equal(section.image_alt, '');
      assert.ok(sectionSchema.safeParse(section).success);
      assert.ok(hasSectionCopy(sanitizeSectionCopy(section.copy)));
    }
    await database.exec('ALTER TABLE sections DROP COLUMN position, DROP COLUMN image_url, DROP COLUMN image_alt');
    await database.exec(migration);
    const upgraded = (await database.query('SELECT * FROM sections ORDER BY sort_order')).rows;
    assert.deepEqual(upgraded, initial);
    await database.exec(migration);
    assert.equal((await database.query('SELECT * FROM sections')).rows.length, 10);
    assert.equal((await database.query('SELECT hero_heading FROM education')).rows[0].hero_heading, 'Keep existing hero');
    await database.exec('SET ROLE anon');
    assert.equal((await database.query('SELECT * FROM sections')).rows.length, 10);
    await assert.rejects(database.exec("INSERT INTO sections (heading, copy) VALUES ('Forbidden', '<p>Copy</p>')"));
    await assert.rejects(database.query('SELECT reorder_sections($1, $2::uuid[])', ['education', initial.map((section) => section.id)]));
    await database.exec("RESET ROLE; SET ROLE authenticated; SET request.jwt.claim.sub = '11111111-1111-4111-8111-111111111111'");
    const home = (await database.query("INSERT INTO sections (type, heading, copy) VALUES ('homepage', 'Home section', '<p>Home copy</p>') RETURNING *")).rows[0];
    const reversed = initial.map((section) => section.id).reverse();
    await database.query('SELECT reorder_sections($1, $2::uuid[])', ['education', reversed]);
    assert.deepEqual((await database.query("SELECT id FROM sections WHERE type = 'education' ORDER BY sort_order")).rows.map((section) => section.id), reversed);
    assert.equal((await database.query('SELECT sort_order FROM sections WHERE id = $1', [home.id])).rows[0].sort_order, home.sort_order);
    for (const ids of [reversed.slice(1), [...reversed.slice(1), reversed[1]], [...reversed.slice(1), home.id], null]) {
      await assert.rejects(database.query('SELECT reorder_sections($1, $2::uuid[])', ['education', ids]));
    }
    assert.deepEqual((await database.query("SELECT id FROM sections WHERE type = 'education' ORDER BY sort_order")).rows.map((section) => section.id), reversed);
    await database.query("UPDATE sections SET heading = 'Updated heading', type = 'homepage' WHERE id = $1", [reversed[0]]);
    assert.equal((await database.query('SELECT sort_order FROM sections WHERE id = $1', [reversed[0]])).rows[0].sort_order, 1);
    await database.query("UPDATE sections SET sort_order = 100 WHERE id = $1", [home.id]);
    const added = (await database.query("INSERT INTO sections (type, heading, copy) VALUES ('homepage', 'Appended', '<p>Copy</p>') RETURNING *")).rows[0];
    assert.equal(added.sort_order, 101);
    const fresh = (await database.query("INSERT INTO sections (heading, copy) VALUES ('Default education', '<p>Copy</p>') RETURNING *")).rows[0];
    assert.equal(fresh.type, 'education');
    assert.equal(fresh.position, 'centre');
    assert.equal(fresh.image_url, '');
    await database.query('UPDATE sections SET image_url = $1, image_alt = $2 WHERE id = $3', ['https://example.com/image.jpg', 'Salon education', fresh.id]);
    for (const position of ['left', 'centre', 'right']) {
      await database.query('UPDATE sections SET position = $1 WHERE id = $2', [position, fresh.id]);
      assert.equal((await database.query('SELECT position FROM sections WHERE id = $1', [fresh.id])).rows[0].position, position);
      assert.equal((await database.query('SELECT image_url FROM sections WHERE id = $1', [fresh.id])).rows[0].image_url, 'https://example.com/image.jpg');
    }
    await database.query("UPDATE sections SET image_url = '', image_alt = '' WHERE id = $1", [fresh.id]);
    assert.deepEqual((await database.query('SELECT image_url, image_alt FROM sections WHERE id = $1', [fresh.id])).rows[0], { image_url: '', image_alt: '' });
    await assert.rejects(database.query('UPDATE sections SET position = $1 WHERE id = $2', ['top', fresh.id]));
    await assert.rejects(database.query('UPDATE sections SET position = $1 WHERE id = $2', [null, fresh.id]));
    assert.equal(fresh.sort_order, 10);
    await database.query('DELETE FROM sections WHERE id = $1', [fresh.id]);
    assert.equal((await database.query('SELECT * FROM sections WHERE id = $1', [fresh.id])).rows.length, 0);
    await assert.rejects(database.exec("INSERT INTO sections (type, heading, copy) VALUES ('bad', 'Heading', '<p>Copy</p>')"));
    await assert.rejects(database.exec("INSERT INTO sections (heading, copy, has_cta) VALUES ('Heading', '<p>Copy</p>', true)"));
    await database.exec("SET request.jwt.claim.sub = ''");
    await assert.rejects(database.exec("INSERT INTO sections (heading, copy) VALUES ('Forbidden', '<p>Copy</p>')"));
  } finally {
    await database.close();
  }
});