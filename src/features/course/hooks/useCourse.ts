import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../../../redux/hooks';
import {
  useGetCoursesQuery,
  useGetCourseByIdQuery,
  useGetCourseBySlugQuery,
  useCreateCourseMutation,
  useUpdateCourseMutation,
  useDeleteCourseMutation,
} from '../api/courseApi';
import { clearCourses } from '../slices/courseSlice';

export const useCourse = () => {
  const dispatch = useAppDispatch();
  const { courses, currentCourse, isLoading, error } = useAppSelector(
    (state) => state.course,
  );

  const useGetCourses = useGetCoursesQuery;
  const useGetCourseById = useGetCourseByIdQuery;
  const useGetCourseBySlug = useGetCourseBySlugQuery;

  const [createCourseMutation, { isLoading: isCreating }] =
    useCreateCourseMutation();
  const [updateCourseMutation, { isLoading: isUpdating }] =
    useUpdateCourseMutation();
  const [deleteCourseMutation, { isLoading: isDeleting }] =
    useDeleteCourseMutation();

  const createCourse = useCallback(
    (data: FormData) => createCourseMutation(data).unwrap(),
    [createCourseMutation],
  );

  const updateCourse = useCallback(
    ({ id, body }: { id: string; body: FormData }) =>
      updateCourseMutation({ id, body }).unwrap(),
    [updateCourseMutation],
  );

  const deleteCourse = useCallback(
    (id: string) => deleteCourseMutation(id).unwrap(),
    [deleteCourseMutation],
  );

  const clearCourseData = useCallback(() => {
    dispatch(clearCourses());
  }, [dispatch]);

  return {
    courses,
    currentCourse,
    isLoading,
    error,
    isCreating,
    isUpdating,
    isDeleting,
    useGetCourses,
    useGetCourseById,
    useGetCourseBySlug,
    createCourse,
    updateCourse,
    deleteCourse,
    clearCourseData,
  };
};
