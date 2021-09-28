import React from "react";
import Modal from "antd/es/modal";
import { IColumnData } from "../tableContent";
import TableContent from "../tableContent";

interface Iprops {
  visible: boolean;
  moduleName: string;
  setVisible: Function;
  dataSource: IColumnData[];
}

export default (props: Iprops) => {
  function handleConfirm() {
    // window.print 会打印body下的所有的dom, 因此需要隐藏reactDom
    const printDom = document.getElementById("log-print");
    if (printDom) {
      // 将body下面的所有节点隐藏
      const bodyChildNodes = document.body.children as any;
      for (let i = 0; i < bodyChildNodes.length; i++) {
        if (bodyChildNodes[i].tagName !== "SCIPT") {
          bodyChildNodes[i].style.display = "none";
        }
      }
      // 复制打印节点 插入到body下面用于打印，打印完毕后移除
      const divDom = document.createElement("div");
      // 设置外层节点用于居中显示
      divDom.setAttribute("style", "display:flex; justify-content: center");
      const newDom = printDom.cloneNode(true);
      divDom.appendChild(newDom);
      document.body.appendChild(divDom);
      window.print();
      document.body.removeChild(divDom);
      props.setVisible(false);
      // 将body下面的所有节点显示
      for (let i = 0; i < bodyChildNodes.length; i++) {
        if (bodyChildNodes[i].tagName !== "SCIPT") {
          bodyChildNodes[i].style.display = "block";
        }
      }
    }
  }

  function handleCancel() {
    props.setVisible(false);
  }

  return (
    <div>
      <Modal
        title="打印预览"
        visible={props.visible}
        width={1200}
        style={{ textAlign: "center" }}
        onOk={handleConfirm}
        onCancel={handleCancel}
        centered
        destroyOnClose
      >
        <div style={{ maxHeight: '700px', overflow: 'auto' }}>
          <div id="log-print">
            <TableContent
              moduleName={props.moduleName}
              loading={false}
              dataSource={props.dataSource}
              showSearch={false}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};
