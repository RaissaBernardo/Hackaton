let produtosDisponiveis = [];
let cart = [];

function buscarTodosProdutos() {
    fetch('http://localhost:8080/api/produtos')
        .then(response => {
            if (!response.ok) throw new Error('Erro ao buscar produtos');
            return response.json();
        })
        .then(produtos => {
            produtosDisponiveis = produtos;
            localStorage.setItem('produtos', JSON.stringify(produtos)); // Cache for cart simulation
            exibirProdutos(produtosDisponiveis);
            exibirCarrinho();
        })
        .catch(error => console.error('Erro ao carregar produtos:', error));
}

function buscarProdutoPorNome() {
    const nomeBuscado = document.getElementById('busca-nome').value.trim().toLowerCase();
    const filtrados = produtosDisponiveis.filter(produto =>
        produto.nome.toLowerCase().includes(nomeBuscado)
    );
    exibirProdutos(filtrados);
}

function exibirProdutos(lista) {
    const productListDiv = document.getElementById('product-list');
    productListDiv.innerHTML = '';

    if (lista.length === 0) {
        productListDiv.innerHTML = '<p>Nenhum produto encontrado.</p>';
        return;
    }

    lista.forEach(produto => {
        const productCard = document.createElement('div');
        productCard.classList.add('product-card');

        let imagensHtml = '';
        if (produto.imagens && produto.imagens.length > 0) {
            imagensHtml = `<img src="${produto.imagens[0]}" alt="${produto.nome}" class="product-image">`;
            if (produto.imagens.length > 1) {
                imagensHtml += `<div class="thumbnail-container">`;
                produto.imagens.slice(1).forEach(url => {
                    imagensHtml += `<img src="${url}" alt="Thumbnail" class="product-thumbnail">`;
                });
                imagensHtml += `</div>`;
            }
        } else {
            imagensHtml = `<p>Sem imagem</p>`;
        }

        productCard.innerHTML = `
            ${imagensHtml}
            <h3>${produto.nome}</h3>
            <p><strong>Descrição:</strong> ${produto.textoDescritivo}</p>
            <p><strong>Cor:</strong> ${produto.cor}</p>
            <p><strong>Fabricante:</strong> ${produto.fabricante}</p>
            <p><strong>Preço:</strong> R$ ${produto.preco.toFixed(2)}</p>
            <p><strong>Quantidade disponível:</strong> ${produto.quantidade}</p>
            <button class="btn" onclick="adicionarAoCarrinho('${produto.nome}')">Adicionar ao Carrinho</button>
        `;
        productListDiv.appendChild(productCard);
    });
}

function adicionarAoCarrinho(nomeProduto) {
    const produto = produtosDisponiveis.find(p => p.nome === nomeProduto);
    if (produto && produto.quantidade > 0) {
        const itemNoCarrinho = cart.find(item => item.nome === nomeProduto);
        if (itemNoCarrinho) {
            if (itemNoCarrinho.quantidadeCarrinho < produto.quantidade) {
                itemNoCarrinho.quantidadeCarrinho++;
            } else {
                alert('Quantidade máxima disponível no estoque.');
                return;
            }
        } else {
            cart.push({ ...produto, quantidadeCarrinho: 1 });
        }
        localStorage.setItem('carrinho', JSON.stringify(cart));
        exibirCarrinho();
    } else {
        alert('Produto indisponível.');
    }
}

function exibirCarrinho() {
    const cartListDiv = document.getElementById('cart-list');
    cartListDiv.innerHTML = '';
    let total = 0;

    cart.forEach(item => {
        const cartItem = document.createElement('div');
        cartItem.classList.add('cart-item');
        const itemTotal = item.preco * item.quantidadeCarrinho;
        total += itemTotal;
        cartItem.innerHTML = `
            <p><strong>${item.nome}</strong> - R$ ${item.preco.toFixed(2)} x 
            <input type="number" min="1" max="${item.quantidade}" value="${item.quantidadeCarrinho}" 
            onchange="atualizarQuantidadeCarrinho('${item.nome}', this.value)">
            = R$ ${itemTotal.toFixed(2)}</p>
        `;
        cartListDiv.appendChild(cartItem);
    });

    document.getElementById('cart-total').textContent = total.toFixed(2);
}

function atualizarQuantidadeCarrinho(nomeProduto, novaQuantidade) {
    const quantidade = parseInt(novaQuantidade);
    const produto = produtosDisponiveis.find(p => p.nome === nomeProduto);
    const item = cart.find(item => item.nome === nomeProduto);

    if (quantidade <= 0) {
        cart = cart.filter(item => item.nome !== nomeProduto);
    } else if (quantidade <= produto.quantidade) {
        item.quantidadeCarrinho = quantidade;
    } else {
        alert('Quantidade excede o estoque disponível.');
        item.quantidadeCarrinho = produto.quantidade;
        event.target.value = produto.quantidade;
    }
    localStorage.setItem('carrinho', JSON.stringify(cart));
    exibirCarrinho();
}

function finalizarCompra() {
    if (cart.length === 0) {
        alert('Carrinho vazio!');
        return;
    }

    cart.forEach(item => {
        const produto = produtosDisponiveis.find(p => p.quantidade === item.quantidade);
        if (produto) {
            produto.quantidade -= item.quantidadeCarrinho;
        }
    });

    produtosDisponiveis = produtosDisponiveis.filter(p => p.quantidade >= 0);
    localStorage.setItem('produtos', JSON.stringify(produtosDisponiveis));
    cart = [];
    localStorage.setItem('carrinho', JSON.stringify(cart));
    alert('Compra finalizada com sucesso!');
    buscarTodosProdutos();
}

function toggleMenu() {
    const menu = document.getElementById('menu-links');
    menu.classList.toggle('active');
}

document.addEventListener('DOMContentLoaded', () => {
    cart = JSON.parse(localStorage.getItem('carrinho')) || [];
    buscarTodosProdutos();
    document.getElementById('busca-nome').addEventListener('input', buscarProdutoPorNome);
});