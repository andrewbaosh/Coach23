/** CoachAgent contract: async review(context) -> proposed review. Never writes plans. */
export class DemoCoachAgent {
  async review(context) {
    return { provider: 'demo-rules', aiGenerated: false, status: 'draft', planApplied: false,
      summary: context.state.recoveryPercent === null
        ? '缺少当日恢复数据；请先补齐数据，再进行教练评审。'
        : '模拟数据流程已完成。真实训练建议需接入数据、个人基线和教练模型后生成。',
      proposedAdjustments: [], requiresHumanReview: true };
  }
}
