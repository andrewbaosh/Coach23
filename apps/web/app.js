const button = document.querySelector('#run');
button.addEventListener('click', async () => {
  button.disabled = true;
  document.querySelector('#status').textContent = '正在同步模拟数据…';
  try {
    const response = await fetch('/api/demo/review');
    if (!response.ok) throw new Error('每日评审失败');
    const data = await response.json();
    document.querySelector('#metrics').textContent = `近 7 日运动时长：${data.context.state.workoutMinutes7d} 分钟 · 模拟恢复分：${data.context.state.recoveryPercent ?? '缺失'}`;
    document.querySelector('#summary').textContent = data.review.summary;
    document.querySelector('#context').textContent = JSON.stringify(data.context, null, 2);
    document.querySelector('#status').textContent = `已完成 · ${data.recordCount} 条模拟记录 · 计划未修改`;
  } catch (error) { document.querySelector('#status').textContent = error.message; }
  finally { button.disabled = false; }
});
