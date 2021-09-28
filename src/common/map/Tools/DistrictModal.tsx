import React,{ useState, useEffect, useReducer } from 'react'
import {Button,Select} from 'antd'
import st from './tools.module.less'
const { Option } = Select;

interface IProps {
    map: AMap.Map | undefined;
    initAdCode?: AllCode;
    onChange?:(current: string, all?: AllCode) => void;
    onComfirm?:(cityCode: string) => void;
    onCancle?:() => void;
}
type AMapData = {adcode:string;name:string}[] | undefined
export type AllCode = { province: string, city: string, county: string}

const District:React.FC<IProps> = (props) =>{
    const { onChange, onCancle, onComfirm, map, initAdCode } = props
    
    const [province, setProvince] = useState<AMapData>() //省
    const [city, setCity] = useState<AMapData>() // 市
    const [district, setDistrict] = useState<AMapData>() // 区
    const [currentCode, setCurrentCode] = useState("") // 当前adcode

    const [currentProvince, setCurrentProvince] = useState('--请选择--')
    const [currentCity, setCurrentCity] = useState('--请选择--')
    const [currentCounty, setCurrentCounty] = useState('--请选择--')

    const [key2,setKey2] = useState('whatever2')
    const [key3,setKey3] = useState('whatever3')

    const districtTool = new AMap.DistrictSearch({
        subdistrict: 1,   //返回下一级行政区
        showbiz:false  //最后一级返回街道信息
    });

    useEffect(() => {
        map?.plugin('AMap.DistrictSearch',() => {
            districtTool.search('中国', (status: AMap.DistrictSearch.SearchStatus, result: AMap.DistrictSearch.SearchResult) => {
                if(status != 'complete') return
                const data = result.districtList[0].districtList?.map((item) => {
                    const {adcode,name} = item
                    return {
                        adcode,
                        name
                    }
                }) 
                setProvince(data)
            });
        })
    },[])

    useEffect(() => {
        (async () => {
            if(!initAdCode) return
            if(!initAdCode.province) return
            setCurrentProvince(initAdCode.province)
            const cityData = await getData(initAdCode.province)
            setCity(cityData)
            if(!initAdCode.city) return
            setCurrentCity(initAdCode.city)
            const countyData = await getData(initAdCode.city)
            setDistrict(countyData)
            if(!initAdCode.county) return
            setCurrentCounty(initAdCode.county)
        })()
    },[initAdCode])
    
    const getData =  (adcode: string) => {
        return new Promise<AMapData>((resolve,reject) => {
            districtTool.search(adcode, function(status: AMap.DistrictSearch.SearchStatus, result: AMap.DistrictSearch.SearchResult) {
                if(status != 'complete') reject()
                const data = result.districtList[0].districtList?.map((item) => {
                    const {adcode,name} = item
                    return {
                        adcode,
                        name
                    }
                })
                resolve(data)
            });
        })
    }

    // 省级联动
    const handleProvinceChange = (value: string) => {
        setCity([])
        setDistrict([])
        setKey2(Math.random() + "")
        setKey3(Math.random() + "")
        getData(value).then((res) => {
            setCity(res)
        })
        setCurrentProvince(value)
        setCurrentCity('')
        setCurrentCounty('')
        setCurrentCode(value)
        setTimeout(() => {
            onChange && onChange(value, {
                province: value,
                city: '',
                county: ''
            })
        })
    }
    // 市级联动
    const handleCityChange = (value: string) => {
        setDistrict([])
        getData(value).then((res) => {
            setDistrict(res)
        })
        setKey3(Math.random() + "")
        setCurrentCity(value)
        setCurrentCounty('')
        setCurrentCode(value)
        setTimeout(() => {
            onChange && onChange(value, {
                province: currentProvince,
                city: value,
                county: ''
            })
        })
    }
    // 区级联动
    const handleDistrictChange = (value: string) => {
        setCurrentCounty(value)
        setCurrentCode(value)
        setTimeout(() => {
            onChange && onChange(value, {
                province: currentProvince,
                city: currentCity,
                county: value
            })
        })
    }

    return(
        <div className={st.district}>
        <h4 className={st.title}>行政区划</h4>
        <div className={st.content}>
            <div className={st.item}>
                <div className={st.left}><span>省:</span></div>
                <Select className={st.right} onChange={handleProvinceChange} value={currentProvince}>
                    {
                        province && province.map(item => <Option key={item.adcode} value={item.adcode}>{item.name}</Option>)
                    }
                </Select>
            </div>
            <div className={st.item}>
                <div className={st.left}><span>市:</span></div>
                <Select key={key2} className={st.right} onChange={handleCityChange} value={currentCity}>
                    {
                        city && city.map(item => <Option key={item.adcode} value={item.adcode}>{item.name}</Option>)
                    }
                </Select>
            </div>
            <div className={st.item}>
                <div className={st.left}><span>区:</span></div>
                <Select key={key3} className={st.right} onChange={handleDistrictChange} value={currentCounty}>
                    {
                        district && district.map(item => <Option key={item.adcode} value={item.adcode}>{item.name}</Option>)
                    }
                </Select>
            </div>
        </div>
        <div className={st.bottom}>
            <Button type='primary' size='small' style={{marginRight:'10px'}} onClick={() => {
                onComfirm && onComfirm(currentCode)
            }}>确认</Button>
            <Button type='primary' size='small' onClick={() => {
                onCancle && onCancle()
            }}>取消</Button>
        </div>
    </div>
    )
}

export default District