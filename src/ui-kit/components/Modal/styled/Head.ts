import styled, { FlattenSimpleInterpolation, css } from 'styled-components/macro';

import { ThemedStyled }                            from '@core/types/theme';

export const Head =  styled.div`
    ${ ({ theme }: ThemedStyled): FlattenSimpleInterpolation => css`
        color: white;
        font-size: 20px;
        text-transform: uppercase;
        width: calc(100% - 5px * 2);
        background-color: ${ theme[theme.mode].secondary };
        padding: 4px 5px;
    ` }
`;