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

// UserDetailsService para cargar los detalles del usuario.
// !!! para simular la contraseña es el Legajo (con prefijo {noop}).

@Service
public class UserDetailsServiceCustom implements UserDetailsService {

    @Override
    public UserDetails loadUserByUsername(String legajo) throws UsernameNotFoundException {
        
        List<GrantedAuthority> authorities = new ArrayList<>();
        String rol = "";
        
        // !!! OJO: La contraseña esperada es "{noop}" + Legajo
        // Asi el passwordEncoder.matches() es Legajo vs. {noop}Legajo, 
        // y siempre debe ser true si se ingreso el legajo como contraseña.
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
        
        // El legajo es username, y el legajo (con {noop}) es la contraseña
        return new User(legajo, expectedPassword, authorities);
    }
}
