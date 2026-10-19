type ApiResponse<T> = T | { error: string };

export const tasksApi = {
  getJobs: async (): Promise<ApiResponse<any[]>> => {
    console.log('Getting jobs');
    return [];
  },
  getAlerts: async (): Promise<ApiResponse<any[]>> => {
    console.log('Getting alerts');
    return [];
  },
  getWorkflows: async (): Promise<ApiResponse<any[]>> => {
    console.log('Getting workflows');
    return [];
  },
  scheduleJob: async (job: any): Promise<ApiResponse<any>> => {
    console.log('Scheduling job:', job);
    return { success: true };
  },
  cancelJob: async (id: string): Promise<ApiResponse<any>> => {
    console.log('Cancelling job:', id);
    return { success: true };
  },
  markAlertRead: async (id: string): Promise<ApiResponse<any>> => {
    console.log('Marking alert as read:', id);
    return { success: true };
  },
  markAllAlertsRead: async (): Promise<ApiResponse<any>> => {
    console.log('Marking all alerts as read');
    return { success: true };
  },
};
