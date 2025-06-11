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
        }
    });

    let temErro = false;

    if (!nome) {
        document.getElementById('error-nome').textContent = "O nome é obrigatório.";
        temErro = true;
    } else if (nome.length < 5) {
        document.getElementById('error-nome').textContent = "O nome deve ter pelo menos 8 caracteres.";
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

        let galleryHtml = '';
        if (produto.imagens && produto.imagens.length > 0) {
            galleryHtml += `
                <div class="main-image-display">
                    <img src="${produto.imagens[0]}" alt="${produto.nome}" class="product-image">
                </div>`;
            if (produto.imagens.length > 1) {
                galleryHtml += `<div class="thumbnail-gallery">`;
                produto.imagens.forEach((url, index) => {
                    const activeClass = (index === 0) ? 'active-thumbnail' : '';
                    galleryHtml += `<img src="${url}" alt="Miniatura ${index + 1}" class="product-thumbnail ${activeClass}" onclick="changeMainImage(this)">`;
                });
                galleryHtml += `</div>`;
            }
        } else {
            galleryHtml = `<p>Sem imagem</p>`;
        }

        let actionButtonsHtml = '';
        if (isLoggedIn) {
            // Use encodeURIComponent and JSON.stringify with proper escaping
            const escapedNome = encodeURIComponent(produto.nome);
            const escapedJson = JSON.stringify(produto).replace(/"/g, '&quot;');
            actionButtonsHtml = `
                <div class="product-actions">
                    <button class="btn small" onclick="abrirModalEdicao(decodeURIComponent('${escapedNome}'), '${escapedJson}')">✏️ Editar</button>
                    <button class="btn danger small" onclick="removerProdutoPorId(${produto.id})">🗑️ Remover por ID</button>
                </div>
            `;
        }

        productCard.innerHTML = `
            ${galleryHtml}
            <h3>${produto.nome}</h3>
            <p><strong>Descrição:</strong> ${produto.textoDescritivo}</p>
            <p><strong>Cor:</strong> ${produto.cor}</p>
            <p><strong>Fabricante:</strong> ${produto.fabricante}</p>
            <p><strong>Preço:</strong> R$ ${produto.preco ? produto.preco.toFixed(2) : 'N/A'}</p>
            <p><strong>Quantidade:</strong> ${produto.quantidade ? produto.quantidade : 'N/A'}</p>
            ${actionButtonsHtml}
        `;
        productListDiv.appendChild(productCard);
    });
}

function removerProdutoPorId(id) {
    if (!isLoggedIn) {
        alert('Faça login para remover produtos.');
        return;
    }
    if (confirm(`Tem certeza que deseja remover o produto com ID: ${id}?`)) {
        fetch(`http://localhost:8080/api/produtos/${id}`, {
            method: 'DELETE'
        })
        .then(response => {
            if (response.ok) {
                alert('Produto removido com sucesso!');
                buscarTodosProdutos();
            } else if (response.status === 404) {
                alert('Produto não encontrado.');
            } else {
                response.json().then(data => {
                    alert('Erro ao remover: ' + (data.message || response.statusText));
                }).catch(() => {
                    alert('Erro ao remover produto.');
                });
            }
        })
        .catch(error => console.error('Erro:', error));
    }
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

function changeMainImage(clickedThumbnail) {
    const productCard = clickedThumbnail.closest('.product-card');
    if (!productCard) return;

    const mainImage = productCard.querySelector('.main-image-display .product-image');
    if (!mainImage) return;

    mainImage.src = clickedThumbnail.src;

    productCard.querySelectorAll('.product-thumbnail').forEach(thumb => {
        thumb.classList.remove('active-thumbnail');
    });
    clickedThumbnail.classList.add('active-thumbnail');
}

function abrirModalEdicao(nomeOriginal, produtoDataJsonString) {
    if (!isLoggedIn) {
        alert('Faça login para editar produtos.');
        return;
    }
    console.log('Abrindo modal com nome:', nomeOriginal, 'e JSON:', produtoDataJsonString);
    const produtoData = JSON.parse(produtoDataJsonString);
    const modal = document.getElementById('editProductModal');
    console.log('Modal element:', modal);
    modal.style.display = 'flex';

    document.getElementById('edit-original-nome').value = nomeOriginal;
    document.getElementById('edit-nome').value = produtoData.nome;
    document.getElementById('edit-descricao').value = produtoData.textoDescritivo;
    document.getElementById('edit-cor').value = produtoData.cor;
    document.getElementById('edit-fabricante').value = produtoData.fabricante;
    document.getElementById('edit-preco').value = produtoData.preco;
    document.getElementById('edit-quantidade').value = produtoData.quantidade;

    const imagensContainerModal = document.getElementById('edit-imagens-container');
    imagensContainerModal.innerHTML = '';

    if (produtoData.imagens && produtoData.imagens.length > 0) {
        produtoData.imagens.forEach((url, index) => {
            const newLabel = document.createElement('label');
            newLabel.innerHTML = `URL da Imagem (${index + 1}): <input type="url" class="imagem-url-input-modal" value="${url}" oninput="previewImagesModal()">`;
            imagensContainerModal.appendChild(newLabel);
        });
    } else {
        const newLabel = document.createElement('label');
        newLabel.innerHTML = `URL da Imagem (1): <input type="url" class="imagem-url-input-modal" oninput="previewImagesModal()">`;
        imagensContainerModal.appendChild(newLabel);
    }
    previewImagesModal();
}

function fecharModal() {
    const modal = document.getElementById('editProductModal');
    modal.style.display = 'none';
}

function adicionarCampoImagemModal() {
    const imagensContainerModal = document.getElementById('edit-imagens-container');
    const newLabel = document.createElement('label');
    const inputCount = document.querySelectorAll('.imagem-url-input-modal').length + 1;
    newLabel.innerHTML = `URL da Imagem (${inputCount}): <input type="url" class="imagem-url-input-modal" placeholder="https://exemplo.com/imagem${inputCount}.jpg" oninput="previewImagesModal()">`;
    imagensContainerModal.appendChild(newLabel);
}

function previewImagesModal() {
    const previewContainerModal = document.getElementById('edit-preview-container');
    previewContainerModal.innerHTML = '';

    const allImageInputsModal = document.querySelectorAll('.imagem-url-input-modal');
    allImageInputsModal.forEach(input => {
        const url = input.value;
        if (url && (url.startsWith('http://') || url.startsWith('https://'))) {
            const img = document.createElement('img');
            img.src = url;
            img.alt = 'Prévia da imagem';
            img.classList.add('image-preview');
            previewContainerModal.appendChild(img);
        }
    });
}

function atualizarProdutoPeloNome() {
    if (!isLoggedIn) {
        alert('Faça login para atualizar produtos.');
        return;
    }
    const originalNome = document.getElementById('edit-original-nome').value;
    const novoNome = document.getElementById('edit-nome').value.trim();
    const novaDescricao = document.getElementById('edit-descricao').value.trim();
    const novaCor = document.getElementById('edit-cor').value.trim();
    const novoFabricante = document.getElementById('edit-fabricante').value.trim();
    const novoPrecoStr = document.getElementById('edit-preco').value.trim();
    const novaQuantidadeStr = document.getElementById('edit-quantidade').value.trim();

    const novoPreco = parseFloat(novoPrecoStr);
    const novaQuantidade = parseInt(novaQuantidadeStr);

    const novasImagens = [];
    let urlInvalida = false;
    document.querySelectorAll('.imagem-url-input-modal').forEach(input => {
        const url = input.value.trim();
        if (url) {
            if (url.startsWith('http://') || url.startsWith('https://')) {
                novasImagens.push(url);
            } else {
                urlInvalida = true;
            }
        }
    });

    let temErro = false;
    if (!novoNome) { temErro = true; alert("O nome no modal é obrigatório."); }
    if (!novaDescricao) { temErro = true; alert("A descrição no modal é obrigatória."); }
    if (!novaCor) { temErro = true; alert("A cor no modal é obrigatória."); }
    if (!novoFabricante) { temErro = true; alert("O fabricante no modal é obrigatório."); }
    if (isNaN(novoPreco)) { temErro = true; alert("O preço no modal deve ser um número válido."); }
    if (isNaN(novaQuantidade)) { temErro = true; alert("A quantidade no modal deve ser um número válido."); }
    if (novasImagens.length === 0 || urlInvalida) { temErro = true; alert("Todas as URLs de imagens no modal são obrigatórias e devem começar com http:// ou https://"); }
    if (temErro) return;

    const produtoAtualizadoData = {
        nome: novoNome,
        textoDescritivo: novaDescricao,
        cor: novaCor,
        fabricante: novoFabricante,
        preco: novoPreco,
        quantidade: novaQuantidade,
        imagens: novasImagens
    };

    fetch(`http://localhost:8080/api/produtos/nome/${encodeURIComponent(originalNome)}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(produtoAtualizadoData)
    })
    .then(response => {
        if (response.ok) {
            alert('Produto atualizado com sucesso!');
            fecharModal();
            buscarTodosProdutos();
        } else {
            response.json().then(errorData => {
                alert('Erro ao atualizar o produto: ' + (errorData.mensagem || response.statusText));
            }).catch(() => {
                alert('Erro ao atualizar o produto: ' + response.statusText);
            });
        }
    })
    .catch(error => console.error('Erro de rede ou na requisição de atualização:', error));
}

document.addEventListener('DOMContentLoaded', () => {
    buscarTodosProdutos();
    document.getElementById('busca-nome').addEventListener('input', buscarProdutoPorNome);
    document.getElementById('login-section').style.display = 'block';
    document.getElementById('cadastro-section').style.display = 'none';
    document.querySelector('.remove-section').style.display = 'none';
});

function toggleMenu() {
    const menu = document.getElementById('menu-links');
    menu.classList.toggle('active');
}

function fazerLogin() {
    const username = document.getElementById('login-username').value.trim();
    const password = document.getElementById('login-password').value.trim();
    const errorMessage = document.getElementById('login-error');

    if (username === 'admin' && password === 'admin') {
        isLoggedIn = true;
        document.getElementById('login-section').style.display = 'none';
        document.getElementById('cadastro-section').style.display = 'block';
        document.querySelector('.remove-section').style.display = 'block';
        document.querySelector('.search-bar').style.display = 'flex';
        alert('Login realizado com sucesso!');
        buscarTodosProdutos();
    } else {
        errorMessage.textContent = 'Usuário ou senha inválidos.';
    }
}