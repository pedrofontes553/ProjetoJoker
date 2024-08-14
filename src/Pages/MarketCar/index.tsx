'use client';
import React, { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import './style.css';

interface IProduto {
  id: string;
  title: string;
  price: number;
  thumbnail: string;
}

interface IShoppingItem {
  produto: IProduto;
  quantidade: number;
}

const CarMarketPage = () => {
  const [searchQuery, setSearchQuery] = useState<string>('iphone');
  const [produtos, setProdutos] = useState<IProduto[]>([]);
  const [shoppingCurso, setShoppingCurso] = useState<IShoppingItem[]>([]);
  const [cartVisible, setCartVisible] = useState<boolean>(false);
  const [showCouponModal, setShowCouponModal] = useState<boolean>(false);
  const [coupon, setCoupon] = useState<string>('');
  const [discountApplied, setDiscountApplied] = useState<boolean>(false);

  useEffect(() => {
    const fetchProducts = async () => {
      const response = await fetch(`https://api.mercadolibre.com/sites/MLB/search?q=${searchQuery}`);
      const data = await response.json();
      setProdutos(data.results);
    };

    fetchProducts();
  }, [searchQuery]);

  const handleAddProduto = (id: string) => {
    const produto = produtos.find((produto) => produto.id === id);
    const produtoExisteShopping = shoppingCurso.find((item) => item.produto.id === id);

    if (produtoExisteShopping) {
      const newShoppingCurso: IShoppingItem[] = shoppingCurso.map((item) => {
        if (item.produto.id === id) {
          return {
            ...item,
            quantidade: item.quantidade + 1,
          };
        }
        return item;
      });
      setShoppingCurso(newShoppingCurso);
    } else {
      const carItem: IShoppingItem = {
        produto: produto!,
        quantidade: 1,
      };
      setShoppingCurso([...shoppingCurso, carItem]);
    }
  };

  const handleRemoveProduto = (id: string) => {
    const ExisteProdutoShopping = shoppingCurso.find((item) => item.produto.id === id);
    if (ExisteProdutoShopping!.quantidade > 1) {
      const newShoppingCurso: IShoppingItem[] = shoppingCurso.map((item) => {
        if (item.produto.id === id) {
          return {
            ...item,
            quantidade: item.quantidade - 1,
          };
        }
        return item;
      });
      setShoppingCurso(newShoppingCurso);
    } else {
      setShoppingCurso(shoppingCurso.filter((item) => item.produto.id !== id));
    }
  };

  const handlePrint = () => {
    const doc = new jsPDF();
    doc.setFontSize(12);
    doc.text('Resumo da Compra:', 10, 10);
    
    let y = 20;
    shoppingCurso.forEach((item) => {
      const totalItem = item.produto.price * item.quantidade;
      doc.text(`Produto: ${item.produto.title}`, 10, y);
      doc.text(`Quantidade: ${item.quantidade}`, 10, y + 10);
      doc.text(`Preço Unitário: R$${item.produto.price.toFixed(2)}`, 10, y + 20);
      doc.text(`Total: R$${totalItem.toFixed(2)}`, 10, y + 30);
      y += 40; // Espaço para o próximo item
    });

    const totalCurso = shoppingCurso.reduce((total, item) => {
      return total + item.produto.price * item.quantidade;
    }, 0);

    if (discountApplied) {
      doc.text(`Desconto aplicado: 50% OFF`, 10, y + 10);
      doc.text(`Total com desconto: R$${(totalCurso * 0.5).toFixed(2)}`, 10, y + 20);
    } else {
      doc.text(`Total: R$${totalCurso.toFixed(2)}`, 10, y + 10);
    }

    doc.text(`Pague com Pix! Chave: pfontes553@gmail.com`, 10, y + 40);

    doc.save('resumo_compra.pdf');
  };

  const handleApplyCoupon = () => {
    if (coupon === 'WallaceQUERO50') {
      setDiscountApplied(true);
    } else {
      alert('Cupom inválido');
    }
    setShowCouponModal(false);
  };

  const handleRemoveCoupon = () => {
    setDiscountApplied(false);
  };

  const totalCurso = shoppingCurso.reduce((total, item) => {
    return total + item.produto.price * item.quantidade;
  }, 0);

  const discountedTotal = discountApplied ? totalCurso * 0.5 : totalCurso;

  const itemCount = shoppingCurso.reduce((total, item) => total + item.quantidade, 0);

  return (
    <div className="page-container">
      <div className="header">
        <div className="header-content">
          <h1>Mercado Livre</h1>
          <button className="cart-icon" onClick={() => setCartVisible(!cartVisible)}>
            🛒
            {itemCount > 0 && <div className="cart-count">{itemCount}</div>}
          </button>
        </div>
        <div className="search-container">
          <input 
            type="text" 
            placeholder="Pesquise um produto..." 
            value={searchQuery} 
            onChange={(e) => setSearchQuery(e.target.value)} 
            className="search-bar"
          />
          <button onClick={() => setSearchQuery(searchQuery)} className="search-button">Buscar</button>
        </div>
      </div>
      <div className="courses-container">
        {produtos.map((produto) => (
          <div key={produto.id} className="course-item">
            <div className="course-image-wrapper">
              <img src={produto.thumbnail} alt={produto.title} className="course-image" />
              <div className="course-overlay">
                <p>{produto.title}</p>
                <p>Preço: R${produto.price.toFixed(2)}</p>
                <button onClick={() => handleAddProduto(produto.id)} className="add-button">Adicionar</button>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className={`cart-sidebar ${cartVisible ? 'visible' : ''}`}>
        <div className="cart-header">
          <h1>Carrinho de compras</h1>
        </div>
        <ul>
          {shoppingCurso.map((item) => (
            <li key={item.produto.id} className="cart-item">
              <img src={item.produto.thumbnail} alt={item.produto.title} />
              <div>
                <p>{item.produto.title}</p>
                <p>Preço Unitário: R${item.produto.price.toFixed(2)}</p>
                <p>Quantidade: {item.quantidade}</p>
              </div>
              <button
                className="quantity-button"
                onClick={() => handleAddProduto(item.produto.id)}
              >
                +
              </button>
              <button
                className="quantity-button"
                onClick={() => handleRemoveProduto(item.produto.id)}
              >
                -
              </button>
            </li>
          ))}
        </ul>
        <div className="cart-total">
          <p>Total: R${totalCurso.toFixed(2)}</p>
          {discountApplied && (
            <>
              <p className="discount-info">50% OFF</p>
              <p className="total">
                <span className="original-price">R${totalCurso.toFixed(2)}</span>
                <span className="discounted-price">R${discountedTotal.toFixed(2)}</span>
              </p>
            </>
          )}
          <div className="buttons-container">
            {!discountApplied && (
              <button className="apply-coupon-link" onClick={() => {
                setShowCouponModal(true);
                document.querySelector('.overlay')?.classList.add('visible');
              }}>Adicionar Cupom</button>
            )}
            {discountApplied && (
              <button className="remove-coupon" onClick={handleRemoveCoupon}>
                Remover Cupom
              </button>
            )}
            <button className="print-button" onClick={handlePrint}>
              Imprimir Notinha
            </button>
          </div>
        </div>
      </div>

      {showCouponModal && (
        <div className="overlay visible"></div>
      )}

      {showCouponModal && (
        <div className="coupon-modal visible">
          <p>Digite Seu Cupom de Desconto:</p>
          <input
            type="text"
            className="coupon-label"
            value={coupon}
            onChange={(e) => setCoupon(e.target.value)}
          />
          <p className="coupon-note">DICA!! Use o Cupom: "WallaceQUERO50" e seja feliz</p>
          <div className="modal-actions">
            <button className="apply-coupon-button" onClick={handleApplyCoupon}>
              Aplicar
            </button>
            <button
              className="cancel-button"
              onClick={() => {
                setShowCouponModal(false);
                document.querySelector('.overlay')?.classList.remove('visible');
              }}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CarMarketPage;
