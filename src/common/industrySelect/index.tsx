// 行业类别下拉
import React, { useState, ReactElement, useEffect } from 'react';
import { Select, } from 'antd';
import { getIndustry } from '@/server/industry';
import { SelectProps, SelectValue } from 'antd/lib/select';
import { FormInstance } from 'antd/lib/form';

interface IIndustry {
    id: string;
    name: string;
}

interface IProps<T> extends SelectProps<T> {
    pid?: string;//父节点id集合，不指定则全部
    [prosName: string]: any;
    formRef?: React.RefObject<FormInstance>;
    borderFlag?: boolean;
    isIE?: boolean;
}

export default function IndustrySelect<valueType extends SelectValue = SelectValue>(props: IProps<SelectValue>): ReactElement {
    const { pid, borderFlag, isIE, ...extra } = props;
    const [industry, setIndustry] = useState<Array<IIndustry>>([]);
    const [iValue, setIValue] = useState('');

    /**
    * 行业类别数据请求
    */
    const getCurIndustry = async () => {
        const params = {
            pid: pid && ''
        }
        const datas = await getIndustry<Array<IIndustry>>(params);

        if (datas) {
            setIndustry(datas);
            if (datas.length > 0) {
                setIValue(datas[0].id);
                if (props.formRef && props.formRef.current) {
                    props.formRef.current.setFieldsValue({ industryId: datas[0].id });
                }
            }
        }
    }

    useEffect(() => {
        getCurIndustry();
    }, [pid]);

    // useEffect(() => {
    //     getCurIndustry();
    // }, [props.value]);



    const onChange = (value: string) => {
        setIValue(value);
    }

    return (
        <Select
            placeholder="请输入行业"
            defaultValue={iValue}
            value={iValue}
            onChange={onChange}
            {...extra}
            bordered={borderFlag == undefined ? false : true}
            style={isIE ? { width: 265, position: 'relative', left: -100, top: 40 } : {}}
        >
            {
                industry && industry.map((item: any) => {
                    return (
                        <Select.Option
                            selected
                            key={item.id}
                            value={item.id}>
                            {item.name}
                        </Select.Option>
                    )
                })
            }
        </Select>
    )
}