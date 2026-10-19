export const workflowApi = {
  createWorkflow: async (data: any) => {
    console.log('Creating workflow:', data);
    return { success: true };
  },
};
