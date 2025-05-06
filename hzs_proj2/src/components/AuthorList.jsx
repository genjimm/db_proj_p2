import React, { useState } from 'react';
import './AuthorList.css';  // 引入样式文件

function AuthorList({ authors, bookId, onAuthorAdded }) {
  const [newAuthorId, setNewAuthorId] = useState('');  // 用于存储待添加的作者ID输入值

  // 处理添加作者操作
  const handleAddAuthor = async () => {
    if (!newAuthorId) return;  // 若输入为空则不执行
    try {
      // 调用添加作者的 API（POST 请求）
      const res = await fetch(`/book/${bookId}/authors`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ authorId: newAuthorId })  // 将作者ID作为JSON发送
      });
      if (res.ok) {
        // 添加成功后清空输入框
        setNewAuthorId('');
        // 通知父组件刷新作者列表
        if (onAuthorAdded) {
          onAuthorAdded();
        }
      } else {
        console.error('添加作者失败，状态码：', res.status);
      }
    } catch (error) {
      console.error('添加作者请求失败:', error);
    }
  };

  return (
    <div className="author-list">
      <h3>作者列表</h3>
      {/* 作者名列表，如果没有作者则显示提示 */}
      {authors.length > 0 ? (
        <ul>
          {authors.map(author => (
            <li key={author.id}>{author.name}</li>
          ))}
        </ul>
      ) : (
        <p>暂无作者信息</p>
      )}
      {/* 添加作者输入框和按钮 */}
      <div className="add-author">
        <input 
          type="text" 
          placeholder="输入作者ID" 
          value={newAuthorId}
          onChange={e => setNewAuthorId(e.target.value)}  // 更新输入值状态
        />
        <button onClick={handleAddAuthor}>添加作者</button>
      </div>
    </div>
  );
}

export default AuthorList;