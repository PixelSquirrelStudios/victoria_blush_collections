const NoResults = () => {
  return (
    <div>
      <div className='flex h-[30vh] flex-col items-center justify-center gap-2'>
        <div className='text-3xl font-medium text-text-primary'>No Results</div>
        <div className='font-regular text-xl text-text-primary'>
          There are no results to display
        </div>
      </div>
    </div>
  );
};
export default NoResults;
