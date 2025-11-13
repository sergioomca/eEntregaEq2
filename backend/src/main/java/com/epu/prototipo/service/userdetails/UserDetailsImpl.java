package com.epu.prototipo.service.userdetails;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import java.util.Collection;
import java.util.Collections;

// Clase parala interface UserDetails de Spring Security.
// Permite a Spring saber como manejar y almacenar la informacion del usuario
// autenticado. Se usas el 'legajo' como username.

public class UserDetailsImpl implements UserDetails {
private final String legajo;
    private final String password;
    private final Collection<? extends GrantedAuthority> authorities;
public UserDetailsImpl(String legajo, String password, String role) {
        this.legajo = legajo;
        this.password = password;
        // Para asignar el Rol como permiso simple
        this.authorities = Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + role.toUpperCase()));
    }
// --- Metodos de interface UserDetails ---
@Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return authorities;
    }
    @Override
    public String getUsername() {
        return legajo;
    }
@Override
    public String getPassword() {
        return password;
    }
    
    // Todas las cuentas como habilitadas, no expiradas, no bloqueadas
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

