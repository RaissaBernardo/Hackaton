package com.projeto.backTechNova.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Entity
@Table(name = "produtos")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Produto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(columnDefinition = "INT")
    private Long id;

    @Column(nullable = false, length = 100)
    private String nome;

    @Column(nullable = false, length = 250)
    private String textoDescritivo;

    @Column(nullable = false, length = 50)
    private String cor;

    @Column(nullable = false, length = 100)
    private String fabricante;

    @Column(nullable = false)
    private Double preco;

    @Column(nullable = false)
    private Integer quantidade;

    @ElementCollection
    @CollectionTable(name = "imagens_produto", joinColumns = @JoinColumn(name = "produto_id"))
    @Column(name = "url_imagem", length = 250, nullable = false)
    private List<String> imagens;
}