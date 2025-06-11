package com.projeto.backTechNova.controller;

import com.projeto.backTechNova.entity.Produto;
import com.projeto.backTechNova.service.ProdutoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Optional;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/produtos")
public class ProdutoController {

    private final ProdutoService produtoService;

    @Autowired
    public ProdutoController(ProdutoService produtoService) {
        this.produtoService = produtoService;
    }

    @PostMapping
    public ResponseEntity<Produto> cadastrarProduto(@RequestBody Produto produto) {
        Produto novoProduto = produtoService.cadastrarProduto(produto);
        return new ResponseEntity<>(novoProduto, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<Produto>> listarTodosProdutos() {
        List<Produto> produtos = produtoService.listarTodosProdutos();
        return new ResponseEntity<>(produtos, HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Produto> buscarProdutoPorId(@PathVariable Long id) {
        Optional<Produto> produto = produtoService.buscarProdutoPorId(id);
        return produto.map(value -> new ResponseEntity<>(value, HttpStatus.OK))
                .orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Produto> atualizarProduto(@PathVariable Long id, @RequestBody Produto produtoAtualizado) {
        Optional<Produto> produto = produtoService.atualizarProduto(id, produtoAtualizado);
        return produto.map(value -> new ResponseEntity<>(value, HttpStatus.OK))
                .orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    @PutMapping("/nome/{nome}")
    public ResponseEntity<?> atualizarProdutoPorNome(@PathVariable String nome, @RequestBody Produto produtoAtualizado) {
        try {
            Optional<Produto> produto = produtoService.atualizarProdutoPorNome(nome, produtoAtualizado);
            return produto.<ResponseEntity<?>>map(value -> new ResponseEntity<>(value, HttpStatus.OK))
                    .orElseGet(() -> {
                        Map<String, String> errorResponse = new HashMap<>();
                        errorResponse.put("mensagem", "Produto com o nome '" + nome + "' não encontrado.");
                        return new ResponseEntity<>(errorResponse, HttpStatus.NOT_FOUND);
                    });
        } catch (RuntimeException e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("mensagem", "Erro interno ao tentar atualizar o produto: " + e.getMessage());
            return new ResponseEntity<>(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PatchMapping("/{id}/estoque")
    public ResponseEntity<Produto> atualizarEstoque(@PathVariable Long id, @RequestParam Integer novaQuantidade) {
        Optional<Produto> produto = produtoService.atualizarEstoque(id, novaQuantidade);
        return produto.map(value -> new ResponseEntity<>(value, HttpStatus.OK))
                .orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    @PatchMapping("/nome/{nome}/estoque")
    public ResponseEntity<?> atualizarEstoquePorNome(@PathVariable String nome, @RequestParam Integer novaQuantidade) {
        try {
            Optional<Produto> produto = produtoService.atualizarEstoquePorNome(nome, novaQuantidade);
            return produto.<ResponseEntity<?>>map(value -> new ResponseEntity<>(value, HttpStatus.OK))
                    .orElseGet(() -> {
                        Map<String, String> errorResponse = new HashMap<>();
                        errorResponse.put("mensagem", "Produto com o nome '" + nome + "' não encontrado.");
                        return new ResponseEntity<>(errorResponse, HttpStatus.NOT_FOUND);
                    });
        } catch (IllegalArgumentException e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("mensagem", "Requisição inválida: " + e.getMessage());
            return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
        } catch (RuntimeException e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("mensagem", "Erro interno ao tentar atualizar o estoque do produto: " + e.getMessage());
            return new ResponseEntity<>(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletarProduto(@PathVariable Long id) {
        boolean deletado = produtoService.deletarProduto(id);
        return deletado ? new ResponseEntity<>(HttpStatus.NO_CONTENT) : new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }

    @DeleteMapping("/nome/{nome}")
    public ResponseEntity<Void> deletarProdutoPorNome(@PathVariable String nome) {
        boolean deletado = produtoService.deletarProdutoPorNome(nome);
        return deletado ? new ResponseEntity<>(HttpStatus.NO_CONTENT) : new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }
}