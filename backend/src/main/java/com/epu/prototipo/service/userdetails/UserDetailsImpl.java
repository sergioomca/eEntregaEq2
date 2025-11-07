package com.epu.prototipo.service.userdetails;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import java.util.Collection;
import java.util.Collections;
/**
 * Clase que implementa la interfaz UserDetails de Spring Security.
 * Esto permite a Spring entender cómo manejar y almacenar la información del usuario
 * autenticado. Aquí usamos el 'legajo' como username.
 */
public class UserDetailsImpl implements UserDetails {
private final String legajo;
    private final String password;
    private final Collection<? extends GrantedAuthority> authorities;
public UserDetailsImpl(String legajo, String password, String role) {
        this.legajo = legajo;
        this.password = password;
        // Asignamos el Rol (HU-002) como autoridad/permiso simple
        this.authorities = Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + role.toUpperCase()));
    }
// --- Métodos de la Interfaz UserDetails ---
@Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return authorities;
    }
// Usamos el legajo como el nombre de usuario (username)
    @Override
    public String getUsername() {
        return legajo;
    }
@Override
    public String getPassword() {
        return password;
    }
    
    // Dejamos todas las cuentas como habilitadas, no expiradas, no bloqueadas
    @Override
    public boolean isAccountNonExpired() {
        return true;
    }
@Override
    public boolean isAccountNonLocked() {
        return true;
    }
@Override
    public boolean isCredentialsNonExpired() {
        return true;
    }
@Override
    public boolean isEnabled() {
        return true;
    }
}

