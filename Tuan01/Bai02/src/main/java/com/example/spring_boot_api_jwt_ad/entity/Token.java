package com.example.spring_boot_api_jwt_ad.entity;

import lombok.Getter;
import lombok.Setter;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Table;
import java.util.Date;

@Entity
@Table(name = "t_token")
@Getter
@Setter
public class Token extends BaseEntity {

    @Column(length = 1000)
    private String token;

    private Date tokenExpDate;

    @Column(name = "token_type")
    private String tokenType; // "ACCESS" hoặc "REFRESH"

    @Column(name = "is_revoked")
    private Boolean isRevoked = false; // false = chưa revoke, true = đã revoke

}
