import ReactDOM from 'react-dom/client';
// import monaco from '@/config/monaco-config';
// monaco.editor.setTheme('custom-light-theme');
import App from './app';

import 'github-markdown-css/github-markdown.css';
import 'antd/dist/reset.css';
import './styles/global.scss';
import './styles/applies.scss';
import './styles/classes.scss';
import './styles/antd.scss';
import './styles/flow.scss';
import 'reactflow/dist/style.css';

const rootElement = document.getElementById('root');
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(<App />);
}
