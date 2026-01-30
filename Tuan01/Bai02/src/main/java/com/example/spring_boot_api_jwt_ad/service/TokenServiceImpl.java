package com.example.spring_boot_api_jwt_ad.service;

import com.example.spring_boot_api_jwt_ad.entity.Token;
import com.example.spring_boot_api_jwt_ad.repository.TokenRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class TokenServiceImpl implements TokenService {

    @Autowired
    private TokenRepository tokenRepository;

    public Token createToken(Token token) {
        return tokenRepository.saveAndFlush(token);
    }

    @Override
    public Token findByToken(String token) {
        return tokenRepository.findByToken(token);
    }

    @Override
    @Transactional
    public void revokeToken(String token) {
        Token tokenEntity = tokenRepository.findByToken(token);
        if (tokenEntity != null) {
            tokenEntity.setIsRevoked(true);
            tokenRepository.saveAndFlush(tokenEntity);
        }
    }
}

