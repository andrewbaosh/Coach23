# Coach23 API 说明

版本：v0.1 · 当前范围：本地模拟 API。

默认地址：`http://127.0.0.1:3023`。服务仅监听本机，尚无认证机制。以下接口均不连接真实运动账号或 AI 模型。

## 1. 已实现接口

| 方法 | 路径 | 返回内容 |
| --- | --- | --- |
| GET | `/api/health` | 服务状态与模拟模式标识 |
| GET | `/api/integrations` | 三家数据源状态，均为未连接且实时功能未实现 |
| GET | `/api/demo/review` | 执行模拟同步，返回记录数量、教练上下文与评审草稿 |
| GET | `/` | 中文调试页面 |

### 健康检查

```json
{"status":"ok","mode":"demo"}
```

### 数据源状态

返回数组，每项包含 `provider`、`connected`、`mode`、`liveImplemented`。三家平台分别为 `strava`、`whoop` 和 `suunto`；当前 `connected` 与 `liveImplemented` 均为 `false`。

### 模拟每日评审

返回字段如下：

| 字段 | 含义 |
| --- | --- |
| `mode` | 固定为 `demo` |
| `recordCount` | 本次同步后该运动员的内存记录数 |
| `context.schemaVersion` | 上下文版本，当前为 1 |
| `context.athleteId` | 演示运动员标识 |
| `context.state` | 计算时间、UTC 时区、七日运动时长、模拟恢复分、HRV 和数据质量 |
| `context.constraints` | 模拟标记、不可应用计划变更的约束及数据限制 |
| `review` | 规则演示草稿，包含摘要、待审阅状态和空的调整列表 |

当前固定演示数据包含七条训练记录和一条恢复记录；零分钟记录也计入记录数量。重复调用在同一天会覆盖相同来源记录。服务跨日运行时内存中可能累积历史记录，`recordCount` 不保证始终为 8。

该 GET 接口仅用于本地演示，会更新内存模拟记录，不修改真实计划。`review.aiGenerated` 和 `review.planApplied` 均为 `false`。

## 2. 错误与缓存

未知路径及未支持的方法返回 JSON 404：

```json
{"error":"Not found"}
```

内部处理失败返回 JSON 500，不暴露内部错误详情：

```json
{"error":"Review failed"}
```

响应设置 `Cache-Control: no-store`。当前不提供跨域访问配置。

## 3. 后续接口规划

正式的同步任务创建、评审生成和计划变更应采用经过认证的 POST 操作，加入幂等键、任务持久化状态、输入校验与用户权限检查。具体路径和请求结构尚未确定。

计划查询、建议确认、OAuth 回调及事件通知接口目前均未实现，不能通过上述模拟接口替代。

相关文档：[产品需求](PRD.md) · [技术架构](architecture.md)。
