package com.project.ChatApp.config;

import com.project.ChatApp.entity.User;
import com.project.ChatApp.repository.UserRepository;
import com.project.ChatApp.utils.JwtUtil;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.Map;
import java.util.Optional;

@Component
@RequiredArgsConstructor
@Slf4j
public class OAuth2SuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;

    @Value("${FRONTEND_URL}")
    private String frontendUrl;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                        Authentication authentication) throws IOException, ServletException {

        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();
        Map<String, Object> attributes = oAuth2User.getAttributes();

        // Try to find the user by email or by provider attributes
        String email = (String) attributes.get("email");
        User user = null;

        if (email != null) {
            Optional<User> byEmail = userRepository.findByEmail(email);
            if (byEmail.isPresent()) {
                user = byEmail.get();
            }
        }

        // Fallback: try to find by provider-specific ID
        if (user == null) {
            // Try Google sub
            String googleSub = (String) attributes.get("sub");
            if (googleSub != null) {
                Optional<User> byProvider = userRepository.findByProviderAndProviderId("google", googleSub);
                if (byProvider.isPresent()) {
                    user = byProvider.get();
                }
            }

            // Try GitHub id
            Object githubId = attributes.get("id");
            if (githubId != null) {
                Optional<User> byProvider = userRepository.findByProviderAndProviderId("github", String.valueOf(githubId));
                if (byProvider.isPresent()) {
                    user = byProvider.get();
                }
            }
        }

        if (user == null) {
            log.error("OAuth2 success handler could not find user after authentication");
            response.sendRedirect(frontendUrl + "/login?error=oauth2_user_not_found");
            return;
        }

        // Generate JWT token using the user's username
        String token = jwtUtil.generateToken(user.getUserName());
        log.info("OAuth2 login successful for user: {}, redirecting to frontend", user.getUserName());

        // Redirect to frontend with the JWT token as a query parameter
        String redirectUrl = frontendUrl + "/oauth2/callback?token=" + token
                + "&username=" + user.getUserName()
                + "&userId=" + user.getId();

        getRedirectStrategy().sendRedirect(request, response, redirectUrl);
    }
}
