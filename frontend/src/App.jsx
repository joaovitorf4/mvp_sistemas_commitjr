import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { ProductDetail } from './pages/ProductDetail';
import { Dashboard } from './pages/Vendor/Dashboard';
import { AddProduct } from './pages/Vendor/AddProduct';
import { Cart } from './pages/Client/Cart';
import { CartProvider } from './contexts/CartContext';
import { MeusPedidos } from './pages/Client/MeusPedidos';
import { Register } from './pages/Register';
import { Header } from './components/Header';

function App() {
  return (
    <BrowserRouter>
      <CartProvider>
        <Header />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/produto/:id" element={<ProductDetail />} />
          <Route path="/carrinho" element={<Cart />} />
          <Route path="/vendedor/dashboard" element={<Dashboard />} /> 
          <Route path="/vendedor/adicionar-produto" element={<AddProduct />} /> 
          <Route path="/cliente/pedidos" element={<MeusPedidos />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </CartProvider>
    </BrowserRouter>
  );
}

export default App;