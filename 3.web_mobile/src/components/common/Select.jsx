import { Select } from 'antd';

const { Option } = Select;

export default function SelectInput(props) {
    let {filterList} = props
    const options = filterList.map(e => <Option key={e.value}>{e.text}</Option>);
    return (
        <Select allowClear showSearch>
      {options}
    </Select>
    )
}