import api from './client';

export const getKPIData = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  const url = `/kpi${query ? `?${query}` : ''}`;
  const response = await api.get(url);
  return response.data;
};
