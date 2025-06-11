let produtosDisponiveis = []; // Armazena todos os produtos disponíveis ao carregar a página

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
    const nome = document.getElementById('nome').value;
    const descricao = document.getElementById('descricao').value;
    const cor = document.getElementById('cor').value;
    const fabricante = document.getElementById('fabricante').value;
    const preco = parseFloat(document.getElementById('preco').value);
    const quantidade = parseInt(document.getElementById('quantidade').value);

    const imagens = [];
    document.querySelectorAll('.imagem-url-input').forEach(input => {
        if (input.value && (input.value.startsWith('http://') || input.value.startsWith('https://'))) {
            imagens.push(input.value);
        }
    });

    if (!nome || !descricao || !cor || !fabricante || isNaN(preco) || isNaN(quantidade)) {
        alert("Preencha todos os campos obrigatórios corretamente.");
        return;
    }

    const produtoData = {
        nome, textoDescritivo: descricao, cor, fabricante, preco, quantidade, imagens
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
            buscarTodosProdutos(); // Atualiza a lista de produtos disponíveis
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
    const nome = document.getElementById('nomeRemover').value;
    if (!nome) {
        alert("Informe o nome do produto a ser removido.");
        return;
    }

    fetch(`http://localhost:8080/api/produtos/nome/${encodeURIComponent(nome)}`, {
        method: 'DELETE'
    })
    .then(response => {
        if (response.ok) {
            alert('Produto removido com sucesso!');
            document.getElementById('nomeRemover').value = '';
            buscarTodosProdutos();
        } else if (response.status === 404) {
            alert('Produto não encontrado.');
        } else {
            alert('Erro ao remover o produto.');
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

document.addEventListener('DOMContentLoaded', () => {
    buscarTodosProdutos();
    document.getElementById('busca-nome').addEventListener('input', buscarProdutoPorNome);
});
