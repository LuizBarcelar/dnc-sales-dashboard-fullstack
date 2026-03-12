import { useState } from 'react' // Adicionado
import styled from 'styled-components'
import { FormComponentProps } from '@/types'
import { StyledButton, StyledInput, StyledP } from '@/components'
import { pxToRem } from '@/utils'
import IconButton from '@mui/material/IconButton' // Adicionado
import Visibility from '@mui/icons-material/Visibility' // Adicionado
import VisibilityOff from '@mui/icons-material/VisibilityOff' // Adicionado

const StyledForm = styled.form`
  display: flex;
  flex-direction: column;
  row-gap: ${pxToRem(16)};
`

// Estilo para o container do input de senha para posicionar o ícone
const InputContainer = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`

function FormComponent(props: FormComponentProps) {
  const { inputs, buttons, message } = props
  const [showPassword, setShowPassword] = useState<Record<number, boolean>>({})

  const togglePassword = (index: number) => {
    setShowPassword((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  }

  return (
    <StyledForm>
      {inputs.map((inputProps, index) => {
        // Agora usamos a variável isPassword para simplificar o código abaixo
        const isPassword = inputProps.type === 'password';
        const isCurrentlyVisible = showPassword[index];

        if (isPassword) {
          return (
            <InputContainer key={index}>
              <StyledInput
                {...inputProps}
                // Se estiver no estado "visível", vira text, senão continua password
                type={isCurrentlyVisible ? 'text' : 'password'}
                style={{ width: '100%' }}
              />
              <IconButton
                onClick={() => togglePassword(index)}
                style={{
                  position: 'absolute',
                  right: '8px',
                  color: '#666'
                }}
              >
                {isCurrentlyVisible ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </InputContainer>
          )
        }

        // Se não for um campo de senha, renderiza o input normal
        return <StyledInput key={index} {...inputProps} />
      })}

      {buttons.map((buttonProps, index) => (
        <StyledButton key={index} {...buttonProps} />
      ))}
      
      {message && (
        <StyledP className={message.type === 'error' ? 'error' : 'success'}>
          {message.msg}
        </StyledP>
      )}
    </StyledForm>
  )
}

export default FormComponent