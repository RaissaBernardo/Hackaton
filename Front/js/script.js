function previewImagem() {
  const file = document.getElementById('imagem').files[0];
  const preview = document.getElementById('preview');

  if (file) {
    const reader = new FileReader();
    reader.onload = function (e) {
      preview.src = e.target.result;
      preview.hidden = false;
    };
    reader.readAsDataURL(file);
  } else {
    preview.hidden = true;
  }
}

function cadastrarProduto() {
  const formData = new FormData();
  formData.append("nome", document.getElementById('nome').value);
  formData.append("descricao", document.getElementById('descricao').value);
  formData.append("cor", document.getElementById('cor').value);
  formData.append("fabricante", document.getElementById('fabricante').value);
  formData.append("preco", document.getElementById('preco').value);
  formData.append("quantidade", document.getElementById('quantidade').value);

  const imagem = document.getElementById('imagem').files[0];
  if (imagem) {
    formData.append("imagem", imagem);
  }

  fetch('http://localhost:8080/produtos', {
    method: 'POST',
    body: formData
  })
  .then(response => {
    if (response.ok) {
      alert('Produto cadastrado com sucesso!');
    } else {
      alert('Erro ao cadastrar o produto.');
    }
  })
  .catch(error => console.error('Erro:', error));
}

function removerProduto() {
  const nome = document.getElementById('nomeRemover').value;

  fetch(`http://localhost:8080/produtos/${encodeURIComponent(nome)}`, {
    method: 'DELETE'
  })
  .then(response => {
    if (response.ok) {
      alert('Produto removido com sucesso!');
    } else {
      alert('Erro ao remover o produto.');
    }
  })
  .catch(error => console.error('Erro:', error));
}
