function previewImagem() {
  const url = document.getElementById('imagem').value;
  const preview = document.getElementById('preview');

  if (url && url.startsWith('http')) {
    preview.src = url;
    preview.hidden = false;
  } else {
    preview.hidden = true;
  }
}

function cadastrarProduto() {
  const produto = {
    nome: document.getElementById('nome').value,
    descricao: document.getElementById('descricao').value,
    cor: document.getElementById('cor').value,
    fabricante: document.getElementById('fabricante').value,
    preco: document.getElementById('preco').value,
    quantidade: document.getElementById('quantidade').value,
    imagem: document.getElementById('imagem').value
  };

  fetch('http://localhost:8080/produtos', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(produto)
  })
  .then(response => {
    if (response.ok) {
      alert('Produto cadastrado com sucesso!');
      limparCampos();
    } else {
      alert('Erro ao cadastrar o produto.');
    }
  })
  .catch(error => console.error('Erro:', error));
}

function removerProduto() {
  const nome = document.getElementById('removerNome').value;

  fetch(`http://localhost:8080/produtos/${encodeURIComponent(nome)}`, {
    method: 'DELETE'
  })
  .then(response => {
    if (response.ok) {
      alert('Produto removido com sucesso!');
      document.getElementById('removerNome').value = '';
    } else {
      alert('Erro ao remover o produto.');
    }
  })
  .catch(error => console.error('Erro:', error));
}

function limparCampos() {
  document.getElementById('nome').value = '';
  document.getElementById('descricao').value = '';
  document.getElementById('cor').value = '';
  document.getElementById('fabricante').value = '';
  document.getElementById('preco').value = '';
  document.getElementById('quantidade').value = '';
  document.getElementById('imagem').value = '';
  document.getElementById('preview').hidden = true;
}
