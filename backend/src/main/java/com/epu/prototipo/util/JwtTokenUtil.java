package com.epu.prototipo.util;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

// Clase para la generacion y validacion de JWTs
@Component
public class JwtTokenUtil {

    // Se inyecta la clave secreta desde application.properties (ej: jwt.secret=BASE64_ENCODED_KEY)
    @Value("${jwt.secret}")
    private String secret;

    // Tiempo de vida del token en milisegundos (ej: 5 horas)
    @Value("${jwt.expiration}")
    private long jwtExpiration;

    // Signing key local secreta
    private java.security.Key signingKey;

    // --- Metodos de Extraccien ---

    /**
     * Extrae el nombre de usuario (subject) del token JWT.
     * @param token 
     * @return Nombre de usuario.
     */
    public String getUsernameFromToken(String token) {
        return getClaimFromToken(token, Claims::getSubject);
    }

    /**
     * Extrae la fecha de expiracion del token JWT.
     * @param token 
     * @return Fecha de expiracion
     */
    public Date getExpirationDateFromToken(String token) {
        return getClaimFromToken(token, Claims::getExpiration);
    }

    /**
     * Extrae un claim especifico del token JWT 
     * @param token 
     * @param claimsResolver 
     * @param <T> Tipo del claim.
     * @return valor del claim.
     */
    public <T> T getClaimFromToken(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = getAllClaimsFromToken(token);
        return claimsResolver.apply(claims);
    }

    /**
     * Metodo para obtener todos los claims (cuerpo) del token JWT.
     * !!! ver CORRECCION: uso sintaxis antigua compilador no encuentra la nueva
     * @param token El token JWT.
     * @return Todos los claims.
     */
    private Claims getAllClaimsFromToken(String token) {
        // Inicializar signingKey si aún no lo está
        if (signingKey == null) {
            // Con el ecreto en Base64 
            byte[] keyBytes = Decoders.BASE64.decode(secret);
            signingKey = Keys.hmacShaKeyFor(keyBytes);
        }

        return Jwts.parserBuilder()
                .setSigningKey(signingKey)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    /**
     * Verifica si el token ha expirado.
     * @param token 
     * @return true si el token ha expirado.
     */
    private Boolean isTokenExpired(String token) {
        final Date expiration = getExpirationDateFromToken(token);
        return expiration.before(new Date());
    }

    // --- Metodos para qenerar Token ---

    /**
     * Genera el token para un usuario dado.
     * @param userDetails 
     * @return Token JWT.
     */
    public String generateToken(UserDetails userDetails) {
        Map<String, Object> claims = new HashMap<>();
        // claims personalizados aca, como roles
        claims.put("roles", userDetails.getAuthorities().stream().map(Object::toString).toList());
        return doGenerateToken(claims, userDetails.getUsername());
    }

    /**
     * Crea el token JWT.
     * @param claims Claims a incluir en el token.
     * @param subject nombre de usuario o ID
     * @return token JWT.
     */
    private String doGenerateToken(Map<String, Object> claims, String subject) {
        final Date createdDate = new Date();
        final Date expirationDate = new Date(createdDate.getTime() + jwtExpiration);

    if (signingKey == null) {
        byte[] keyBytes = Decoders.BASE64.decode(secret);
        signingKey = Keys.hmacShaKeyFor(keyBytes);
    }

    return Jwts.builder()
        .setClaims(claims)
        .setSubject(subject)
        .setIssuedAt(createdDate)
        .setExpiration(expirationDate)
        .signWith(signingKey, SignatureAlgorithm.HS256)
        .compact();
    }

    // --- Metodos de Validacion ---

    /**
     * Verifica si el token es valido para el usuario
     * @param token token JWT
     * @param userDetails 
     * @return true si token valido.
     */
    public Boolean validateToken(String token, UserDetails userDetails) {
        final String username = getUsernameFromToken(token);
        return (username.equals(userDetails.getUsername()) && !isTokenExpired(token));
    }
   
}