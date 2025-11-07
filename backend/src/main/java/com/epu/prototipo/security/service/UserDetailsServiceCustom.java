package com.epu.prototipo.security.service;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

/**
 * Implementación de UserDetailsService para cargar los detalles del usuario.
 * Configuracion de prototipado: La contraseña es el Legajo (con prefijo {noop}).
 */
@Service
public class UserDetailsServiceCustom implements UserDetailsService {

    @Override
    public UserDetails loadUserByUsername(String legajo) throws UsernameNotFoundException {
        
        List<GrantedAuthority> authorities = new ArrayList<>();
        String rol = "";
        
        // 🚨 CRÍTICO para el prototipo: La contraseña esperada será "{noop}" + Legajo
        // Esto garantiza que el passwordEncoder.matches() sea Legajo vs. {noop}Legajo, 
        // lo que siempre debe ser true si se ingresó el legajo como contraseña.
        String expectedPassword = "{noop}" + legajo; 

        switch (legajo) {
            case "VINF011422":
                rol = "ROLE_EMISOR";
                break;
            case "SUP222":
                rol = "ROLE_SUPERVISOR";
                break;
            case "EJE444":
                rol = "ROLE_EJECUTANTE";
                break;
            case "ADM999":
                rol = "ROLE_ADMIN";
                break;
            default:
                throw new UsernameNotFoundException("Usuario no encontrado con legajo: " + legajo);
        }

        authorities.add(new SimpleGrantedAuthority(rol));
        
        // El legajo se usa como username, y el legajo (con {noop}) como contraseña simulada
        return new User(legajo, expectedPassword, authorities);
    }
}
