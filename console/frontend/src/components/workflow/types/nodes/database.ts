export interface useDatabaseDetailProps {
  handleCustomSQL: () => void;
  handleDbChange: (dbId: string) => void;
  handleformdata: () => void;
  modeChange: (value: number) => void;
  getFields: (list: unknown[], dbId: string, tableName: string) => void;
}
