import Select from 'react-select';

const DummySelect = () => {
  return (
    <Select
      isMulti
      placeholder={'Filter by . . .'}
      className='basic-multi-select rounded-lg text-black'
      classNamePrefix='select'
      styles={{
        control: (provided) => ({
          ...provided,
          backgroundColor: '#fff',
          border: 'none',
          borderRadius: '10px!important',
          boxShadow: 'none',
          minHeight: '48px',
          maxHeight: '48px',
          overflow: 'hidden',
          alignItems: 'center',
          paddingLeft: '15px',
          '&:hover': {
            borderColor: '#fff',
            cursor: 'pointer',
          },
        }),
        option: (provided, state) => ({
          ...provided,
          color: state.isSelected ? '#fff' : '#000',
          backgroundColor: state.isSelected ? '#e20098' : '#fff',
          '&:hover': {
            backgroundColor: '#e20098',
            color: '#fff',
            cursor: 'pointer',
          },
        }),
        multiValue: (provided) => ({
          ...provided,
          backgroundColor: '#e20098',
          color: '#fff',
        }),
        multiValueLabel: (provided) => ({
          ...provided,
          color: '#fff',
        }),
        multiValueRemove: (provided) => ({
          ...provided,
          color: '#fff',
          '&:hover': {
            backgroundColor: '#e20060',
            color: '#fff',
          },
        }),
      }}
    />
  );
};

export default DummySelect;
