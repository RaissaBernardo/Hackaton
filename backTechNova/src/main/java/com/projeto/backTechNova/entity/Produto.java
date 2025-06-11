package com.projeto.backTechNova.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Produto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
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
    @CollectionTable(name = "imagens_produto", joinColumns = @JoinColumn(name = "produto_id")) // Ajustado: nome da tabela de imagens e typo
    @Column(name = "url_imagem", length = 250)
    private List<String> imagens;
}