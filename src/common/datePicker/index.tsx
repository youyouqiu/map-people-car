import React, { ReactElement } from 'react'
import { DatePicker } from 'antd'
import moment, { Moment } from 'moment'
import { DatePickerProps, RangePickerProps } from 'antd/lib/date-picker'

const datePicker = (props: DatePickerProps): ReactElement => {

    const { value, onChange, ...extra } = props

    const actValue: Moment | undefined = value ? moment(value, '') : undefined

    function change(date: any, value: any) {
        if (onChange) {
            onChange(value, date)
        }
    }

    return (
        <DatePicker value={actValue} onChange={change} {...extra} />
    )
}


const RangePicker = (props: RangePickerProps): ReactElement => {

    const { value, onChange, ...extra } = props

    const actValue: [Moment | null, Moment | null] = value ? value.length ? [ value[0] ? moment(value[0]) : null, value[1] ? moment(value[1]) : null] : [null, null] : [null, null]

    function change(date: any, value: any) {
        if (onChange) {
            onChange(value, date)
        }
    }

    return (
        <DatePicker.RangePicker value={actValue} onChange={change} {...extra} />
    )
}
export {
    RangePicker,
    RangePickerProps,
    DatePickerProps
}
export default datePicker