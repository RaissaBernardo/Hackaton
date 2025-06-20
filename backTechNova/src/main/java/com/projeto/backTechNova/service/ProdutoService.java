package com.projeto.backTechNova.service;

import com.projeto.backTechNova.entity.Produto;
import com.projeto.backTechNova.repository.ProdutoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class ProdutoService {

    private final ProdutoRepository produtoRepository;

    @Autowired
    public ProdutoService(ProdutoRepository produtoRepository) {
        this.produtoRepository = produtoRepository;
    }

    @Transactional
    public Produto cadastrarProduto(Produto produto) {
        return produtoRepository.save(produto);
    }

    public List<Produto> listarTodosProdutos() {
        return produtoRepository.findAll();
    }

    public Optional<Produto> buscarProdutoPorId(Long id) {
        return produtoRepository.findById(id);
    }

    @Transactional
    public Optional<Produto> atualizarProduto(Long id, Produto produtoAtualizado) {
        Optional<Produto> produtoExistente = produtoRepository.findById(id);
        if (produtoExistente.isPresent()) {
            Produto produto = produtoExistente.get();
            produto.setNome(produtoAtualizado.getNome());
            produto.setTextoDescritivo(produtoAtualizado.getTextoDescritivo());
            produto.setCor(produtoAtualizado.getCor());
            produto.setFabricante(produtoAtualizado.getFabricante());
            produto.setPreco(produtoAtualizado.getPreco());
            produto.setQuantidade(produtoAtualizado.getQuantidade());
            produto.setImagens(produtoAtualizado.getImagens());

            return Optional.of(produtoRepository.save(produto));
        }
        return Optional.empty();
    }

    @Transactional
    public Optional<Produto> atualizarProdutoPorNome(String nome, Produto produtoAtualizado) {
        try {
            Optional<Produto> produtoExistente = produtoRepository.findByNome(nome);
            if (produtoExistente.isPresent()) {
                Produto produto = produtoExistente.get();
                produto.setNome(produtoAtualizado.getNome());
                produto.setTextoDescritivo(produtoAtualizado.getTextoDescritivo());
                produto.setCor(produtoAtualizado.getCor());
                produto.setFabricante(produtoAtualizado.getFabricante());
                produto.setPreco(produtoAtualizado.getPreco());
                produto.setQuantidade(produtoAtualizado.getQuantidade());
                produto.setImagens(produtoAtualizado.getImagens());

                return Optional.of(produtoRepository.save(produto));
            } else {
                return Optional.empty();
            }
        } catch (Exception e) {
            System.err.println("Erro ao atualizar produto pelo nome '" + nome + "': " + e.getMessage());
            throw new RuntimeException("Ocorreu um erro ao tentar atualizar o produto pelo nome: " + e.getMessage());
        }
    }

    @Transactional
    public Optional<Produto> atualizarEstoque(Long id, Integer novaQuantidade) {
        Optional<Produto> produtoExistente = produtoRepository.findById(id);
        if (produtoExistente.isPresent()) {
            Produto produto = produtoExistente.get();
            if (novaQuantidade >= 0) {
                produto.setQuantidade(novaQuantidade);
                return Optional.of(produtoRepository.save(produto));
            } else {
                return Optional.empty();
            }
        }
        return Optional.empty();
    }

    @Transactional
    public Optional<Produto> atualizarEstoquePorNome(String nome, Integer novaQuantidade) {
        try {
            Optional<Produto> produtoExistente = produtoRepository.findByNome(nome);
            if (produtoExistente.isPresent()) {
                Produto produto = produtoExistente.get();
                if (novaQuantidade >= 0) {
                    produto.setQuantidade(novaQuantidade);
                    return Optional.of(produtoRepository.save(produto));
                } else {
                    throw new IllegalArgumentException("A nova quantidade não pode ser negativa.");
                }
            } else {
                return Optional.empty();
            }
        } catch (IllegalArgumentException e) {
            throw e;
        } catch (Exception e) {
            System.err.println("Erro ao atualizar estoque pelo nome '" + nome + "': " + e.getMessage());
            throw new RuntimeException("Ocorreu um erro ao tentar atualizar o estoque pelo nome: " + e.getMessage());
        }
    }

    @Transactional
    public boolean deletarProduto(Long id) {
        if (produtoRepository.existsById(id)) {
            produtoRepository.deleteById(id);
            return true;
        }
        return false;
    }

    @Transactional
    public boolean deletarProdutoPorNome(String nome) {
        Long deletedCount = produtoRepository.deleteByNome(nome);
        return deletedCount > 0;
    }
}