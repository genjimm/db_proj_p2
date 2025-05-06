import React from 'react';
import './CopyList.css';  // 引入样式文件

function CopyList({ copies, bookId, onCopyAdded }) {

  // 处理添加副本操作
  const handleAddCopy = async () => {
    try {
      // 调用添加副本的 API（POST 请求）
      const res = await fetch(`/book/${bookId}/copy`, { method: 'POST' });
      if (res.ok) {
        // 添加成功后通知父组件刷新副本列表
        if (onCopyAdded) {
          onCopyAdded();
        }
      } else {
        console.error('添加副本失败，状态码：', res.status);
      }
    } catch (error) {
      console.error('添加副本请求失败:', error);
    }
  };

  return (
    <div className="copy-list">
      <h3>副本列表</h3>
      {/* 副本列表显示，如果没有副本则提示 */}
      {copies.length > 0 ? (
        <ul>
          {copies.map(copy => (
            <li key={copy.id}>
              副本ID: {copy.id}，状态: {copy.status}
            </li>
          ))}
        </ul>
      ) : (
        <p>暂无副本信息</p>
      )}
      {/* 添加副本按钮 */}
      <button onClick={handleAddCopy}>添加副本</button>
    </div>
  );
}

export default CopyList;