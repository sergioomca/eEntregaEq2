package com.epu.prototipo.security.service;

import com.epu.prototipo.dto.UsuarioDTO;
import com.epu.prototipo.service.IUsuarioService;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

// UserDetailsService que carga usuarios desde IUsuarioService (Firestore o in-memory).
// La contraseña es el legajo (con prefijo {noop}).

@Service
public class UserDetailsServiceCustom implements UserDetailsService {

    private final IUsuarioService usuarioService;

    public UserDetailsServiceCustom(IUsuarioService usuarioService) {
        this.usuarioService = usuarioService;
    }

    @Override
    public UserDetails loadUserByUsername(String legajo) throws UsernameNotFoundException {
        UsuarioDTO usuario;
        try {
            usuario = usuarioService.getUsuarioByLegajo(legajo);
        } catch (RuntimeException e) {
            throw new UsernameNotFoundException("Usuario no encontrado con legajo: " + legajo);
        }

        List<GrantedAuthority> authorities = new ArrayList<>();
        List<String> roles = usuario.getRoles();

        // Mapear cada rol del usuario a Spring Security GrantedAuthority
        if (roles != null && !roles.isEmpty()) {
            for (String rol : roles) {
                String springRole = "ROLE_" + rol.replace(" ", "_");
                authorities.add(new SimpleGrantedAuthority(springRole));
            }
        } else {
            throw new UsernameNotFoundException("Usuario sin roles asignados: " + legajo);
        }

        // Usar la contraseña almacenada del usuario, o legajo como fallback
        String storedPassword = usuario.getPassword();
        if (storedPassword == null || storedPassword.isEmpty()) {
            storedPassword = usuario.getLegajo();
        }
        String expectedPassword = "{noop}" + storedPassword;

        return new User(legajo, expectedPassword, authorities);
    }
}
