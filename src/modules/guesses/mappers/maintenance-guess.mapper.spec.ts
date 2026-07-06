import { GuessListItemResponseDTO } from '../dtos/guess.dto';
import { filterTaskGuesses } from '../mappers/maintenance-guess.mapper';

function base(
  overrides: Partial<GuessListItemResponseDTO> = {},
): GuessListItemResponseDTO {
  const row = new GuessListItemResponseDTO();
  row.id = 'g1';
  row.text = 'Instalar cerca';
  row.email = 'a@x.com';
  row.createdAt = '2024-06-16T12:00:00.000Z';
  row.status = 'pending';
  return Object.assign(row, overrides);
}

describe('filterTaskGuesses', () => {
  it('filtra por status', () => {
    const rows = [
      base({ id: '1', status: 'pending' }),
      base({ id: '2', status: 'considered' }),
    ];
    expect(filterTaskGuesses(rows, { status: 'considered' })).toHaveLength(1);
  });

  it('filtra por e-mail e texto (substring)', () => {
    const rows = [
      base({ id: '1', email: 'foo@x.com', text: 'cerca' }),
      base({ id: '2', email: 'bar@x.com', text: 'pista' }),
    ];
    expect(filterTaskGuesses(rows, { email: 'foo' })).toHaveLength(1);
    expect(filterTaskGuesses(rows, { text: 'pista' })).toHaveLength(1);
  });

  it('filtra por intervalo de datas', () => {
    const rows = [base({ createdAt: '2024-06-10T12:00:00.000Z' })];
    expect(
      filterTaskGuesses(rows, {
        startDate: '2024-06-01',
        endDate: '2024-06-15',
      }),
    ).toHaveLength(1);
    expect(
      filterTaskGuesses(rows, {
        startDate: '2024-06-20',
      }),
    ).toHaveLength(0);
  });
});
