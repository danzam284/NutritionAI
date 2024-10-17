import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Upload from './components/Upload.jsx';
import Home from './components/Home.jsx';
import SavedMeal from './components/SavedMeal.jsx';
import './index.css';

const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/upload",
    element: <Upload />,
  },
  {
    path: "/savedmeal",
    element: <SavedMeal />,
  }
]);

createRoot(document.getElementById('root')).render(
  <RouterProvider router={router} />
);
