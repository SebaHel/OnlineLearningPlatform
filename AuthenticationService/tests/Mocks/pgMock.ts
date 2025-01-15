const mockQuery = jest.fn();
const mockConnect = jest.fn().mockResolvedValue({
  query: mockQuery,
  release: jest.fn(),
});
const mockPool = jest.fn().mockImplementation(() => ({
  connect: mockConnect,
}));

export { mockQuery, mockConnect, mockPool };
