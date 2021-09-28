import React, { ReactNode, CSSProperties, useState } from 'react';
import { message, Upload } from 'antd';
import styles from './index.module.less';
import { Loading3QuartersOutlined } from '@ant-design/icons';
import { getStore } from '@/framework/utils/localStorage';
interface IProps {
    children: ReactNode | ReactNode[];
    style?: CSSProperties;
    onSuccess: Function;
}

function IconUpload(props: IProps) {
    const [uploadDisabled, setUploadDisabled] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    const accept = 'image/png, image/jpeg,image/jpg';

    // const getBase64 = (img: any, callback: Function) => {
    //     const reader = new FileReader();
    //     reader.addEventListener('load', () => callback(reader.result));
    //     reader.readAsDataURL(img);
    // }
    const uploadHandleChange = (info: any) => {
        const { status } = info.file;
        console.log(info)
        if (!status) {
            return false
        }
        if (status === 'done') {
            // getBase64(info.file.originFileObj, (imageUrl: string) => {

            // });
            const resData: any = info.file.response.data;
            setUploadDisabled(false);
            setUploadProgress(0);
            return props.onSuccess(resData, info.file)

        }
        // 上传进度事件 
        if (status === 'uploading') {
            setUploadDisabled(true);
            setUploadProgress(info.file.percent);
        } else {
            setUploadDisabled(false);
            setUploadProgress(0);
            message.warning('上传异常')
        }

    }
    //上传前的校验
    const beforeUpload = (file: any) => {
        console.log(file);
        const filesType = file.type;
        const fileSize = file.size;
        const size = 1024 * 1000;
        if (!filesType || accept.indexOf(filesType) === -1) {
            message.warning('请上传' + accept + '格式的文件')
            return false
        }
        if (fileSize > size) {
            message.warning('请上传大小不超过1M的文件');
            return false
        }
        return true

    }
    const { children, style } = props;
    return (
        <Upload
            name='file'
            accept={accept}
            disabled={uploadDisabled}
            data={
                { type: 3 }
            }
            action='/api/mb/icon/saveIcon'
            // {...defaultOpt}
            style={style}
            showUploadList={false}
            headers={{
                'Authorization': `Bearer ${getStore('token')}`
            }}
            beforeUpload={beforeUpload}
            onChange={uploadHandleChange}
        >
            <span className={styles['icon-upload']}>
                {
                    uploadProgress ? <div className={styles['uploadProgress']} >
                        <Loading3QuartersOutlined spin />
                        <div className={styles['uploadProgress-tip']} > {uploadProgress}% 上传中</div>
                    </div> : children
                }
            </span>
        </Upload>
    )
}



export default IconUpload



