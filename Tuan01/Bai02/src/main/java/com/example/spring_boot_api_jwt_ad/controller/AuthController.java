package com.example.spring_boot_api_jwt_ad.controller;

import com.example.spring_boot_api_jwt_ad.authen.UserPrincipal;
import com.example.spring_boot_api_jwt_ad.entity.Token;
import com.example.spring_boot_api_jwt_ad.entity.User;
import com.example.spring_boot_api_jwt_ad.service.TokenService;
import com.example.spring_boot_api_jwt_ad.service.UserService;
import com.example.spring_boot_api_jwt_ad.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
public class AuthController {

    @Autowired
    private UserService userService;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private TokenService tokenService;

    @PostMapping("/register")
    public User register(@RequestBody User user){
        user.setPassword(new BCryptPasswordEncoder().encode(user.getPassword()));

        return userService.createUser(user);
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody User user){

        UserPrincipal userPrincipal =
                userService.findByUsername(user.getUsername());

        if (null == user || !new BCryptPasswordEncoder()
                .matches(user.getPassword(), userPrincipal.getPassword())) {

            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Account or password is not valid!");
        }

        // Tạo Access Token (15 phút)
        String accessToken = jwtUtil.generateAccessToken(userPrincipal);
        Token accessTokenEntity = new Token();
        accessTokenEntity.setToken(accessToken);
        accessTokenEntity.setTokenExpDate(jwtUtil.generateAccessTokenExpirationDate());
        accessTokenEntity.setTokenType("ACCESS");
        accessTokenEntity.setIsRevoked(false);
        accessTokenEntity.setCreatedBy(userPrincipal.getUserId());
        tokenService.createToken(accessTokenEntity);

        // Tạo Refresh Token (7 ngày)
        String refreshToken = jwtUtil.generateRefreshToken(userPrincipal);
        Token refreshTokenEntity = new Token();
        refreshTokenEntity.setToken(refreshToken);
        refreshTokenEntity.setTokenExpDate(jwtUtil.generateRefreshTokenExpirationDate());
        refreshTokenEntity.setTokenType("REFRESH");
        refreshTokenEntity.setIsRevoked(false);
        refreshTokenEntity.setCreatedBy(userPrincipal.getUserId());
        tokenService.createToken(refreshTokenEntity);

        // Trả về cả Access Token và Refresh Token
        Map<String, String> tokens = new HashMap<>();
        tokens.put("accessToken", accessToken);
        tokens.put("refreshToken", refreshToken);

        return ResponseEntity.ok(tokens);
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(@RequestHeader(value = "Authorization", required = false) String authorizationHeader){
        
        if (!StringUtils.hasText(authorizationHeader) || !authorizationHeader.startsWith("Token ")) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Token is required!");
        }

        String token = authorizationHeader.substring(6);
        
        // Revoke token trong DB
        tokenService.revokeToken(token);

        return ResponseEntity.ok("Logout successful!");
    }


    @GetMapping("/hello")
    // Endpoint này chỉ yêu cầu authenticated, không cần permission cụ thể
    // Để test permission, có thể thêm @PreAuthorize("hasAnyAuthority('USER_READ')")
    public ResponseEntity hello(){
        return ResponseEntity.ok("hello");
    }




//    Object principal = SecurityContextHolder
//            .getContext().getAuthentication().getPrincipal();
//
//        if (principal instanceof UserDetails) {
//        UserPrincipal userPrincipal = (UserPrincipal) principal;
//    }

}
