let produtosDisponiveis = [];
let isLoggedIn = false;

function previewAllImages() {
    const previewContainer = document.getElementById('preview-container');
    previewContainer.innerHTML = '';

    const allImageInputs = document.querySelectorAll('.imagem-url-input');
    allImageInputs.forEach(input => {
        const url = input.value;
        if (url && (url.startsWith('http://') || url.startsWith('https://'))) {
            const img = document.createElement('img');
            img.src = url;
            img.alt = 'Prévia da imagem';
            img.classList.add('image-preview');
            previewContainer.appendChild(img);
        }
    });
}

function adicionarCampoImagem() {
    if (!isLoggedIn) {
        alert('Faça login para adicionar imagens.');
        return;
    }
    const imagensContainer = document.getElementById('imagens-container');
    const inputCount = document.querySelectorAll('.imagem-url-input').length + 1;
    const newLabel = document.createElement('label');
    newLabel.innerHTML = `URL da Imagem (${inputCount}): 
        <input type="url" class="imagem-url-input" 
        placeholder="https://exemplo.com/imagem${inputCount}.jpg" 
        oninput="previewAllImages()">`;
    imagensContainer.appendChild(newLabel);
}

function cadastrarProduto() {
    if (!isLoggedIn) {
        alert('Faça login para cadastrar produtos.');
        return;
    }

    const camposErro = ['nome', 'descricao', 'cor', 'fabricante', 'preco', 'quantidade', 'imagens'];
    camposErro.forEach(campo => {
        document.getElementById('error-' + campo).textContent = '';
    });

    const nome = document.getElementById('nome').value.trim();
    const descricao = document.getElementById('descricao').value.trim();
    const cor = document.getElementById('cor').value.trim();
    const fabricante = document.getElementById('fabricante').value.trim();
    const precoStr = document.getElementById('preco').value.trim();
    const quantidadeStr = document.getElementById('quantidade').value.trim();

    const preco = parseFloat(precoStr);
    const quantidade = parseInt(quantidadeStr);

    const imagens = [];
    let urlInvalida = false;
    document.querySelectorAll('.imagem-url-input').forEach(input => {
        const url = input.value.trim();
        if (url) {
            if (url.startsWith('http://') || url.startsWith('https://')) {
                imagens.push(url);
            } else {
                urlInvalida = true;
            }
        } else {
            urlInvalida = true;
        }
    });

    let temErro = false;

    if (!nome) {
        document.getElementById('error-nome').textContent = "O nome é obrigatório.";
        temErro = true;
    } else if (nome.length < 10) {
        document.getElementById('error-nome').textContent = "O nome deve ter pelo menos 10 caracteres.";
        temErro = true;
    }

    if (!descricao) {
        document.getElementById('error-descricao').textContent = "A descrição é obrigatória.";
        temErro = true;
    } else if (descricao.length < 20) {
        document.getElementById('error-descricao').textContent = "A descrição deve ter pelo menos 20 caracteres.";
        temErro = true;
    }

    if (!cor) {
        document.getElementById('error-cor').textContent = "A cor é obrigatória.";
        temErro = true;
    }

    if (!fabricante) {
        document.getElementById('error-fabricante').textContent = "O fabricante é obrigatório.";
        temErro = true;
    }

    if (!precoStr) {
        document.getElementById('error-preco').textContent = "O preço é obrigatório.";
        temErro = true;
    } else if (isNaN(preco)) {
        document.getElementById('error-preco').textContent = "O preço deve ser um número válido.";
        temErro = true;
    }

    if (!quantidadeStr) {
        document.getElementById('error-quantidade').textContent = "A quantidade é obrigatória.";
        temErro = true;
    } else if (isNaN(quantidade)) {
        document.getElementById('error-quantidade').textContent = "A quantidade deve ser um número válido.";
        temErro = true;
    }

    if (imagens.length === 0 || urlInvalida) {
        document.getElementById('error-imagens').textContent = "Todas as URLs de imagens são obrigatórias e devem começar com http:// ou https://";
        temErro = true;
    }

    if (temErro) {
        return;
    }

    const produtoData = {
        nome,
        textoDescritivo: descricao,
        cor,
        fabricante,
        preco,
        quantidade,
        imagens
    };

    fetch('http://localhost:8080/api/produtos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(produtoData)
    })
    .then(response => {
        if (response.ok) {
            alert('Produto cadastrado com sucesso!');
            limparCamposCadastro();
            buscarTodosProdutos();
        } else {
            response.json().then(data => {
                alert('Erro ao cadastrar: ' + (data.message || response.statusText));
            }).catch(() => {
                alert('Erro ao cadastrar produto.');
            });
        }
    })
    .catch(error => console.error('Erro na requisição:', error));
}

function removerProduto() {
    if (!isLoggedIn) {
        alert('Faça login para remover produtos.');
        return;
    }

    const nomeRemover = document.getElementById('nomeRemover').value.trim();
    if (!nomeRemover) {
        alert('Digite o nome do produto para remover.');
        return;
    }

    fetch(`http://localhost:8080/api/produtos/nome/${encodeURIComponent(nomeRemover)}`, {
        method: 'DELETE'
    })
    .then(response => {
        if (response.ok) {
            alert('Produto removido com sucesso!');
            document.getElementById('nomeRemover').value = '';
            buscarTodosProdutos();
        } else {
            response.json().then(data => {
                alert('Erro ao remover: ' + (data.message || response.statusText));
            }).catch(() => {
                alert('Erro ao remover produto.');
            });
        }
    })
    .catch(error => console.error('Erro na requisição:', error));
}

function buscarTodosProdutos() {
    fetch('http://localhost:8080/api/produtos')
        .then(response => {
            if (!response.ok) throw new Error('Erro ao buscar produtos');
            return response.json();
        })
        .then(produtos => {
            produtosDisponiveis = produtos;
            exibirProdutos(produtosDisponiveis);
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
            <p><strong>Quantidade:</strong> ${produto.quantidade}</p>
        `;
        productListDiv.appendChild(productCard);
    });
}

function limparCamposCadastro() {
    document.getElementById('nome').value = '';
    document.getElementById('descricao').value = '';
    document.getElementById('cor').value = '';
    document.getElementById('fabricante').value = '';
    document.getElementById('preco').value = '';
    document.getElementById('quantidade').value = '';
    document.getElementById('imagens-container').innerHTML = `
        <label>URL da Imagem (1):
            <input type="url" class="imagem-url-input" placeholder="https://exemplo.com/imagem1.jpg" oninput="previewAllImages()">
        </label>`;
    document.getElementById('preview-container').innerHTML = '';
}

function fazerLogin() {
    const username = document.getElementById('login-username').value.trim();
    const password = document.getElementById('login-password').value.trim();
    const errorMessage = document.getElementById('login-error');

    if (username === 'admin' && password === 'admin') {
        isLoggedIn = true;
        document.getElementById('login-section').style.display = 'none';
        document.getElementById('cadastro-section').style.display = 'block';
        alert('Login realizado com sucesso!');
        buscarTodosProdutos();
    } else {
        errorMessage.textContent = 'Usuário ou senha inválidos.';
    }
}

function toggleMenu() {
    const menu = document.getElementById('menu-links');
    menu.classList.toggle('active');
}

document.addEventListener('DOMContentLoaded', () => {
    buscarTodosProdutos();
    document.getElementById('busca-nome').addEventListener('input', buscarProdutoPorNome);
});