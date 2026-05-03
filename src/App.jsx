import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Suspense, lazy } from 'react';

// Lazy load components
const Home = lazy(() => import('./compo/Home'));
const Cart = lazy(() => import('./compo/cart/Cart'));
const Checkout = lazy(() => import('./compo/checkout/Checkout'));
const ProductDetails = lazy(() => import('./compo/product/ProductDetails'));
const OrderSuccess = lazy(() => import('./compo/order/OrderSuccess'));

// Regular imports
import Footer from './compo/footer/Footer';
import Header from './compo/header/Header';
import MetaPixel from './compo/MetaPixel';
import ScrollTop from './compo/header/ScrollTop';;

// Redux actions
import PaymentStatusPage from './compo/checkout/PaymentStatusPage';


// Disable console logs
console.log = () => { };
console.debug = () => { };
console.info = () => { };
console.warn = () => { };


function App() {


  // if (isAppLoading) {
  //   return <Loader progress={loadingProgress} />;
  // }

  return (
    <Router>
      <Suspense>
        <ScrollTop />
        <MetaPixel />
        <Header />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/product/:id" element={<ProductDetails />} />
          <Route path="/order-success" element={<OrderSuccess />} />
          <Route path="/payment-status" element={<PaymentStatusPage />} />
        </Routes>
        <Footer />
      </Suspense>
    </Router>
  );
}

export default App;
