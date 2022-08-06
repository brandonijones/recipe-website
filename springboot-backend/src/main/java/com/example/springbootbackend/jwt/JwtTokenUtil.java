package com.example.springbootbackend.jwt;

import com.example.springbootbackend.model.Account;
import io.jsonwebtoken.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.Date;

@Component
public class JwtTokenUtil {

    private static final long EXPIRE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

    private static final Logger LOGGER = LoggerFactory.getLogger(JwtTokenUtil.class);

    private String message;

    @Value("${app.jwt.secret}")
    private String SECRET_KEY;

    public String generateAccessToken(Account account) {
        return Jwts.builder()
                .setSubject(String.format("%s <H~> %s <H~> %s <H~> %s <H~> %s <H~> %s <H~> %s",
                        account.getId(),
                        account.getEmail(),
                        account.getUsername(),
                        account.getName(),
                        account.getProfilePicture(),
                        account.getBio(),
                        account.getRole()))
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + EXPIRE_DURATION))
                .signWith(SignatureAlgorithm.HS512, SECRET_KEY)
                .compact();
    }

    // Used to verify a given JWT. It returns true if the JWT is verified, or false otherwise.
    public boolean validateAccessToken(String token) {
        try {
            Jwts.parser().setSigningKey(SECRET_KEY).parseClaimsJws(token);
            return true;
        } catch (ExpiredJwtException e) {
            setMessage("JWT expired");
            System.out.println(getMessage());
            LOGGER.error(getMessage(), e.getMessage());
        } catch (IllegalArgumentException e) {
            setMessage("Token is null, empty or only whitespace");
            System.out.println(getMessage());
            LOGGER.error(getMessage(), e.getMessage());
        } catch (MalformedJwtException e) {
            setMessage("JWT is invalid");
            System.out.println(getMessage());
            LOGGER.error(getMessage(), e);
        } catch (UnsupportedJwtException e) {
            setMessage("JWT is not supported");
            System.out.println(getMessage());
            LOGGER.error(getMessage(), e);
        } catch (SignatureException e) {
            setMessage("Signature validation failed");
            System.out.println(getMessage());
            LOGGER.error(getMessage());
        }

        return false;
    }

    // Gets the value of the subject field of a given token.
    public String getSubject(String token) {
        return parseClaims(token).getSubject();
    }

    private Claims parseClaims(String token) {
        return Jwts.parser()
                .setSigningKey(SECRET_KEY)
                .parseClaimsJws(token)
                .getBody();
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}
