import { RuntimeOrchestrator } from '../runtime/orchestrator';

export class FinanceApi {
  constructor(private readonly orchestrator: RuntimeOrchestrator) {}

  async getWallet(id: number, userId = 1) {
    const execution = await this.orchestrator.execute({
      action: 'finance.getWallet',
      payload: { id },
      userId,
      sessionId: userId,
      containerId: 0,
      moduleId: 0,
    });
    return execution.result;
  }

  async listWallets(userId = 1) {
    const execution = await this.orchestrator.execute({
      action: 'finance.listWallets',
      payload: {},
      userId,
      sessionId: userId,
      containerId: 0,
      moduleId: 0,
    });
    return execution.result;
  }

  async getBalance(walletId: number, userId = 1) {
    const execution = await this.orchestrator.execute({
      action: 'finance.getBalance',
      payload: { walletId },
      userId,
      sessionId: userId,
      containerId: 0,
      moduleId: 0,
    });
    return execution.result;
  }

  async listTransactions(walletId?: number, userId = 1) {
    const execution = await this.orchestrator.execute({
      action: 'finance.listTransactions',
      payload: { walletId },
      userId,
      sessionId: userId,
      containerId: 0,
      moduleId: 0,
    });
    return execution.result;
  }

  async listLedgerEntries(walletId?: number, userId = 1) {
    const execution = await this.orchestrator.execute({
      action: 'finance.listLedgerEntries',
      payload: { walletId },
      userId,
      sessionId: userId,
      containerId: 0,
      moduleId: 0,
    });
    return execution.result;
  }
}

export function createFinanceApi(orchestrator: RuntimeOrchestrator) {
  return new FinanceApi(orchestrator);
}
