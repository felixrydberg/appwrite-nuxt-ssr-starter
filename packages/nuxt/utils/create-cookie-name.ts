export default () => {
  const { appwriteProjectId } = useRuntimeConfig().public;
  return `a_session_${appwriteProjectId}`;
};
