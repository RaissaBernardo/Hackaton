package com.projeto.backTechNova.repository;

import com.projeto.backTechNova.entity.Produto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ProdutoRepository extends JpaRepository<Produto,Long> {
    Optional<Produto> findByNome(String nome);
    Long deleteByNome(String nome);
}
