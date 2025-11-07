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

/**
 * Clase de utilidad para la generación y validación de JSON Web Tokens (JWT).
 */
@Component
public class JwtTokenUtil {

    // Se inyecta la clave secreta desde application.properties (ej: jwt.secret=BASE64_ENCODED_KEY)
    @Value("${jwt.secret}")
    private String secret;

    // Tiempo de vida del token en milisegundos (ej: 5 horas)
    @Value("${jwt.expiration}")
    private long jwtExpiration;

    // Local cached signing key built from the secret
    private java.security.Key signingKey;

    // --- Métodos de Extracción de Claims ---

    /**
     * Extrae el nombre de usuario (subject) del token JWT.
     * @param token El token JWT.
     * @return Nombre de usuario.
     */
    public String getUsernameFromToken(String token) {
        return getClaimFromToken(token, Claims::getSubject);
    }

    /**
     * Extrae la fecha de expiración del token JWT.
     * @param token El token JWT.
     * @return Fecha de expiración.
     */
    public Date getExpirationDateFromToken(String token) {
        return getClaimFromToken(token, Claims::getExpiration);
    }

    /**
     * Extrae un claim específico del token JWT utilizando una función resolutora.
     * @param token El token JWT.
     * @param claimsResolver Función para resolver el claim.
     * @param <T> Tipo del claim.
     * @return El valor del claim.
     */
    public <T> T getClaimFromToken(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = getAllClaimsFromToken(token);
        return claimsResolver.apply(claims);
    }

    /**
     * Método interno para obtener todos los claims (cuerpo) del token JWT.
     * CORRECCIÓN: Se utiliza la sintaxis antigua, asumiendo que el compilador no encuentra la API moderna.
     * @param token El token JWT.
     * @return Todos los claims.
     */
    private Claims getAllClaimsFromToken(String token) {
        // Inicializar signingKey si aún no lo está
        if (signingKey == null) {
            // Asumimos que el secreto está en Base64 (por seguridad, usar una clave suficientemente larga)
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
     * @param token El token JWT.
     * @return true si el token ha expirado.
     */
    private Boolean isTokenExpired(String token) {
        final Date expiration = getExpirationDateFromToken(token);
        return expiration.before(new Date());
    }

    // --- Métodos de Generación de Token ---

    /**
     * Genera el token para un usuario dado.
     * @param userDetails Detalles del usuario.
     * @return Token JWT.
     */
    public String generateToken(UserDetails userDetails) {
        Map<String, Object> claims = new HashMap<>();
        // Puedes agregar claims personalizados aquí, como roles
        claims.put("roles", userDetails.getAuthorities().stream().map(Object::toString).toList());
        return doGenerateToken(claims, userDetails.getUsername());
    }

    /**
     * Crea el token JWT.
     * @param claims Claims a incluir en el token.
     * @param subject El sujeto (nombre de usuario o ID).
     * @return El token JWT.
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

    // --- Métodos de Validación ---

    /**
     * Valida si el token es válido para el usuario.
     * @param token El token JWT.
     * @param userDetails Detalles del usuario.
     * @return true si el token es válido.
     */
    public Boolean validateToken(String token, UserDetails userDetails) {
        final String username = getUsernameFromToken(token);
        return (username.equals(userDetails.getUsername()) && !isTokenExpired(token));
    }

    // El método getSigningKey() ya no es necesario con la sintaxis antigua.
    // Si aún lo tienes, bórralo o coméntalo para evitar conflictos.
}