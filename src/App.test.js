/* eslint-env jest */
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from './App';
import AppProviders from './AppProviders';
import { LIB_KEY } from './lib/storage';
import { encodeShare } from './lib/share';

const seed = (items) => localStorage.setItem(LIB_KEY, JSON.stringify(items));
const base = { type: 'movie', status: 'want', overview: 'Something happens.', rating: 7.5, poster: null };

const renderAt = (path) => render(
  <MemoryRouter initialEntries={[path]} future={{ v7_relativeSplatPath: true }}>
    <AppProviders><App /></AppProviders>
  </MemoryRouter>,
);

beforeEach(() => localStorage.clear());

test('empty library invites the first add', () => {
  renderAt('/');
  expect(screen.getByRole('heading', { name: 'Your library' })).toBeInTheDocument();
  expect(screen.getByText(/waiting for its first title/i)).toBeInTheDocument();
});

test('cards show genres without any filter and chips filter them', () => {
  seed([
    { ...base, id: 1, title: 'Alpha', genres: ['Action', 'Sci-Fi'], runtime: 120, addedAt: 2 },
    { ...base, id: 2, title: 'Bravo', genres: ['Comedy'], runtime: 90, addedAt: 1 },
  ]);
  renderAt('/');
  const alpha = screen.getByRole('heading', { name: 'Alpha' }).closest('article');
  expect(within(alpha).getByText('Action')).toBeInTheDocument();
  expect(within(alpha).getByText('Sci-Fi')).toBeInTheDocument();
  expect(within(alpha).getByText('2h')).toBeInTheDocument();

  fireEvent.click(screen.getByRole('button', { name: /Comedy/ }));
  expect(screen.queryByRole('heading', { name: 'Alpha' })).not.toBeInTheDocument();
  expect(screen.getByRole('heading', { name: 'Bravo' })).toBeInTheDocument();
});

test('quick action marks a title watched', () => {
  seed([{ ...base, id: 1, title: 'Alpha', genres: ['Drama'], addedAt: 1 }]);
  renderAt('/');
  fireEvent.click(screen.getByRole('button', { name: /Mark Alpha as watched/ }));
  expect(JSON.parse(localStorage.getItem(LIB_KEY))[0]).toMatchObject({ status: 'watched' });
});

test('tonight prints a ticket from unwatched titles only', async () => {
  seed([
    { ...base, id: 1, title: 'Only Unwatched', genres: ['Comedy'], runtime: 90, addedAt: 1 },
    { ...base, id: 2, title: 'Already Seen', genres: ['Comedy'], runtime: 90, addedAt: 1, status: 'watched' },
  ]);
  renderAt('/tonight');
  fireEvent.click(screen.getByRole('button', { name: /Pick for me/ }));
  const ticket = await screen.findByRole('article', { name: /Tonight.s pick/ }, { timeout: 3000 });
  expect(within(ticket).getByRole('heading', { name: 'Only Unwatched' })).toBeInTheDocument();
});

test('share link renders its name and asks for the key when TMDB is not configured', () => {
  const hash = encodeShare({ name: 'Friday plans', items: [{ id: 550, type: 'movie', status: 'want' }] });
  renderAt(`/share#d=${hash}`);
  expect(screen.getByRole('heading', { name: 'Friday plans' })).toBeInTheDocument();
  expect(screen.getByText(/Add your TMDB key/i)).toBeInTheDocument();
});

test('a broken share link explains itself', () => {
  renderAt('/share#d=broken');
  expect(screen.getByText(/doesn.t hold a list/i)).toBeInTheDocument();
});

test.each([
  ['/privacy', 'Privacy policy'],
  ['/terms', 'Terms and conditions'],
  ['/cookies', 'Cookies and storage'],
  ['/credits', 'Credits and disclaimer'],
  ['/about', 'About WatchList'],
])('%s renders', (path, title) => {
  renderAt(path);
  expect(screen.getByRole('heading', { level: 1, name: title })).toBeInTheDocument();
});

test('old bookmarks redirect and unknown paths show 404', async () => {
  renderAt('/addnew');
  expect(await screen.findByRole('heading', { name: 'Add a title' })).toBeInTheDocument();
});

test('unknown route shows not found', () => {
  renderAt('/definitely/not/here');
  expect(screen.getByText(/isn.t here/i)).toBeInTheDocument();
});

test('settings exports are disabled with an empty list', async () => {
  renderAt('/settings');
  await waitFor(() => expect(screen.getByRole('button', { name: /Export backup/ })).toBeDisabled());
});
