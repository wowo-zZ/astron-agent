const baseURL = (): string => {
  // 在客户端环境下检查是否为localhost
  if (
    typeof window !== 'undefined' &&
    window.location.hostname === 'localhost'
  ) {
    return '/xingchen-api';
  }

  // 通过import.meta.env.MODE获取构建时的环境模式
  const mode = import.meta.env.MODE;
  switch (mode) {
    case 'development':
      return 'http://172.29.202.54:8080';
    case 'test':
      return 'http://172.29.201.92:8080';
    default:
      // production和其他环境保持原有逻辑
      return 'http://172.29.201.92:8080';
  }
};

export const getFixedUrl = (path: string): string => {
  return `${baseURL()}${path}`;
};

export const getAuthorization = (): string => {
  return `Bearer ${localStorage.getItem('accessToken')}`;
};

export const handleFlowExport = (currentFlow: unknown): void => {
  fetch(getFixedUrl(`/workflow/export/${currentFlow?.id}`), {
    method: 'GET',
    headers: {
      Authorization: getAuthorization(),
    },
  }).then(async res => {
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentFlow?.name}.yml`;
    document.body.appendChild(a);
    a.click();
    a.remove();

    window.URL.revokeObjectURL(url);
  });
};
